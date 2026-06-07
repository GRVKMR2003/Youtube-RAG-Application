"""
Chroma DB Persistent Vector Store wrapper using LangChain.
"""
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from core.config import settings

_embedding_fn = None
_store = None


def get_embedding_function():
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = OllamaEmbeddings(
            model=settings.EMBEDDING_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )
    return _embedding_fn


def get_vector_store(collection_name: str = "youtube_rag") -> Chroma:
    """Return (or create) the persistent Chroma DB vector store."""
    global _store
    if _store is None:
        _store = Chroma(
            collection_name=collection_name,
            embedding_function=get_embedding_function(),
            persist_directory=settings.CHROMA_PERSIST_DIR,
        )
    return _store
