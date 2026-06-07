"""
YouTube RAG - FastAPI Backend Entry Point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import ingest, query, summarize, notes

app = FastAPI(
    title="YouTube RAG API",
    description="Turn YouTube videos into searchable AI knowledge bases.",
    version="1.0.0",
)

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(ingest.router,   prefix="/ingest",   tags=["Ingest"])
app.include_router(query.router,    prefix="/query",    tags=["Query"])
app.include_router(summarize.router,prefix="/summarize",tags=["Summarize"])
app.include_router(notes.router,    prefix="/notes",    tags=["Notes"])


@app.get("/")
def root():
    return {"message": "YouTube RAG API is running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}
