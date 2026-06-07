"""
/notes  – Upload PDF or text files and store them alongside video chunks.
"""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

from core.config import settings
from core.vector_store import get_vector_store

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "text/plain"}


@router.post("/upload")
async def upload_notes(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only PDF and TXT are supported."
        )

    content = await file.read()

    if file.content_type == "application/pdf":
        text = _extract_pdf_text(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the file.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )
    chunks = splitter.split_text(text)
    doc_id = str(uuid.uuid4())[:8]

    docs = [
        Document(
            page_content=chunk,
            metadata={
                "source": file.filename,
                "doc_id": doc_id,
                "type": "note",
                "timestamp": 0.0,
                "timestamp_label": "N/A",
            }
        )
        for chunk in chunks
    ]

    store = get_vector_store()
    store.add_documents(docs)

    return {
        "status": "Notes uploaded successfully",
        "filename": file.filename,
        "chunks_stored": len(docs),
        "doc_id": doc_id,
    }


def _extract_pdf_text(content: bytes) -> str:
    """Extract text from PDF bytes using pypdf."""
    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")
