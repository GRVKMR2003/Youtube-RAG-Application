from pydantic import BaseModel, HttpUrl
from typing import List, Optional


class IngestRequest(BaseModel):
    url: str  # YouTube URL


class IngestResponse(BaseModel):
    status: str
    video_id: str
    chunks_stored: int


class Source(BaseModel):
    timestamp: float
    timestamp_label: str   # e.g. "2:03"
    text: str
    source: str            # YouTube URL


class QueryRequest(BaseModel):
    question: str
    video_id: Optional[str] = None   # filter to a specific video


class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]


class SummarizeRequest(BaseModel):
    video_id: str


class SummarizeResponse(BaseModel):
    title: str
    summary: str
    key_points: List[str]
    topics: List[str]


class TimestampExplainRequest(BaseModel):
    video_id: str
    timestamp: float


class TimestampExplainResponse(BaseModel):
    explanation: str
    timestamp_label: str
