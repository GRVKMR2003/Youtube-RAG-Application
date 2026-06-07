"""
/summarize  – Generate a structured summary of an ingested video.
"""
from fastapi import APIRouter, HTTPException
from langchain.schema import HumanMessage

from core.vector_store import get_vector_store
from core.llm import get_llm
from core.config import settings
from models.schemas import SummarizeRequest, SummarizeResponse, TimestampExplainRequest, TimestampExplainResponse

router = APIRouter()


def _get_all_chunks(video_id: str) -> list[str]:
    store = get_vector_store()
    try:
        result = store.get(where={"video_id": video_id}, include=["documents"])
        return result.get("documents", [])
    except Exception:
        return []


@router.post("", response_model=SummarizeResponse)
def summarize_video(request: SummarizeRequest):
    chunks = _get_all_chunks(request.video_id)
    if not chunks:
        raise HTTPException(
            status_code=404,
            detail=f"No content found for video {request.video_id}. Please ingest it first."
        )

    # Combine up to ~6000 chars of transcript
    combined = " ".join(chunks)[:6000]

    prompt = f"""You are a summarization expert. Analyze this YouTube video transcript and return a structured JSON summary.

Transcript excerpt:
{combined}

Return ONLY valid JSON in this exact format:
{{
  "title": "A short descriptive title for the video",
  "summary": "A clear 3-5 sentence summary of the entire video",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "topics": ["Topic 1", "Topic 2", "Topic 3"]
}}"""

    llm = get_llm(temperature=0.3)
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        import json, re
        text = response.content
        # Extract JSON block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON found in response")
        data = json.loads(match.group())
        return SummarizeResponse(
            title=data.get("title", "Video Summary"),
            summary=data.get("summary", ""),
            key_points=data.get("key_points", []),
            topics=data.get("topics", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


@router.post("/explain-timestamp", response_model=TimestampExplainResponse)
def explain_timestamp(request: TimestampExplainRequest):
    """Explain what happens at a specific timestamp in a video."""
    store = get_vector_store()

    # Find the chunk closest to the requested timestamp
    try:
        results = store.similarity_search(
            query="explain this section",
            k=3,
            filter={"video_id": request.video_id},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not results:
        raise HTTPException(status_code=404, detail="No content found near this timestamp.")

    # Pick the closest timestamp chunk
    best = min(results, key=lambda d: abs(d.metadata.get("timestamp", 0) - request.timestamp))
    context = best.page_content

    def _fmt(s: float) -> str:
        s = int(s)
        h, r = divmod(s, 3600)
        m, sec = divmod(r, 60)
        return f"{h}:{m:02}:{sec:02}" if h else f"{m}:{sec:02}"

    prompt = f"""Explain the following segment from a YouTube video that starts around timestamp {_fmt(request.timestamp)}:

"{context}"

Give a clear, engaging 2-3 sentence explanation of what is being discussed."""

    llm = get_llm(temperature=0.4)
    response = llm.invoke(prompt)
    return TimestampExplainResponse(
        explanation=response.content,
        timestamp_label=_fmt(request.timestamp),
    )
