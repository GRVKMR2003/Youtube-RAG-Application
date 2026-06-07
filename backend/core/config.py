"""
Centralised config loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3.2")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", "5"))


settings = Settings()
