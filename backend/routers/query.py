"""
/query  – Semantic search + LLM answer generation with source timestamps.
"""
from fastapi import APIRouter, HTTPException
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from core.config import settings
from core.vector_store import get_vector_store
from core.llm import get_llm
from models.schemas import QueryRequest, QueryResponse, Source

router = APIRouter()

QA_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are an expert assistant that answers questions based on YouTube video transcripts.

Use ONLY the context below to answer the question. If the context does not contain enough information,
say "I don't have enough information from this video to answer that."

Context:
{context}

Question: {question}

Answer (be concise, clear, and helpful):""",
)


@router.post("", response_model=QueryResponse)
def query_video(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    store = get_vector_store()

    # Build retriever with optional video filter
    search_kwargs: dict = {"k": settings.TOP_K_RESULTS}
    if request.video_id:
        search_kwargs["filter"] = {"video_id": request.video_id}

    retriever = store.as_retriever(search_kwargs=search_kwargs)

    # Check if we have any docs
    try:
        docs = retriever.invoke(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")

    if not docs:
        return QueryResponse(
            answer="No relevant content found. Please ingest a video first.",
            sources=[],
        )

    llm = get_llm()
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": QA_PROMPT},
        return_source_documents=True,
    )

    try:
        result = chain.invoke({"query": request.question})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    answer = result.get("result", "")
    source_docs = result.get("source_documents", [])

    # Deduplicate sources by timestamp
    seen_ts = set()
    sources = []
    for doc in source_docs:
        meta = doc.metadata
        ts = meta.get("timestamp", 0.0)
        if ts not in seen_ts:
            seen_ts.add(ts)
            sources.append(Source(
                timestamp=ts,
                timestamp_label=meta.get("timestamp_label", "0:00"),
                text=doc.page_content[:200],
                source=meta.get("source", ""),
            ))

    sources.sort(key=lambda s: s.timestamp)

    return QueryResponse(answer=answer, sources=sources)
