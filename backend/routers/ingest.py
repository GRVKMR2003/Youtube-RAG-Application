"""
/ingest  – Download YouTube transcript, chunk it, embed and store in Chroma.
"""
import re
from typing import List

from fastapi import APIRouter, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

from core.config import settings
from core.vector_store import get_vector_store
from models.schemas import IngestRequest, IngestResponse

router = APIRouter()


def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
        r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
        r"(?:embed\/)([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def seconds_to_label(seconds: float) -> str:
    """Convert seconds to MM:SS or HH:MM:SS label."""
    s = int(seconds)
    h, remainder = divmod(s, 3600)
    m, sec = divmod(remainder, 60)
    if h:
        return f"{h}:{m:02}:{sec:02}"
    return f"{m}:{sec:02}"


def fetch_transcript(video_id: str) -> List[dict]:
    """Fetch transcript segments from YouTube."""
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
        return [{"text": seg.text, "start": seg.start, "duration": seg.duration} for seg in transcript]
    except TranscriptsDisabled:
        raise HTTPException(status_code=422, detail="Subtitles are disabled for this video.")
    except NoTranscriptFound:
        raise HTTPException(status_code=422, detail="No transcript found for this video.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcript fetch error: {str(e)}")


def build_documents(transcript: List[dict], video_id: str, url: str) -> List[Document]:
    """
    Merge transcript segments into larger chunks while preserving timestamp metadata.
    Each Document carries the start-time of the FIRST segment it covers.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )

    # Merge all segments into one string, tagging each sentence with its timestamp
    merged_text = " ".join(seg["text"] for seg in transcript)
    # Build a map: character_offset -> timestamp
    char_offset = 0
    offset_map = []
    for seg in transcript:
        offset_map.append((char_offset, seg["start"]))
        char_offset += len(seg["text"]) + 1  # +1 for space

    chunks = splitter.split_text(merged_text)

    docs = []
    pos = 0
    for chunk in chunks:
        # Find the timestamp of the closest segment before this chunk
        chunk_start_in_full = merged_text.find(chunk, pos)
        timestamp = 0.0
        for off, ts in reversed(offset_map):
            if off <= chunk_start_in_full:
                timestamp = ts
                break
        pos = chunk_start_in_full + 1

        docs.append(Document(
            page_content=chunk,
            metadata={
                "video_id": video_id,
                "source": url,
                "timestamp": timestamp,
                "timestamp_label": seconds_to_label(timestamp),
            }
        ))

    return docs


@router.post("", response_model=IngestResponse)
def ingest_video(request: IngestRequest):
    try:
        video_id = extract_video_id(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    transcript = fetch_transcript(video_id)
    docs = build_documents(transcript, video_id, request.url)

    store = get_vector_store()

    # Delete any previously stored chunks for this video
    try:
        existing = store.get(where={"video_id": video_id})
        if existing and existing.get("ids"):
            store.delete(ids=existing["ids"])
    except Exception:
        pass  # Chroma may raise if collection is empty

    store.add_documents(docs)

    return IngestResponse(
        status="Video processed successfully",
        video_id=video_id,
        chunks_stored=len(docs),
    )
