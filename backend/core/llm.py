"""
LLM helper – returns a configured ChatOllama instance.
"""
from langchain_ollama import ChatOllama
from core.config import settings


def get_llm(temperature: float = 0.2) -> ChatOllama:
    return ChatOllama(
        model=settings.LLM_MODEL,
        temperature=temperature,
        base_url=settings.OLLAMA_BASE_URL,
    )
