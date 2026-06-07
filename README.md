# VideoMind ⚡

VideoMind is a local, AI-powered YouTube RAG (Retrieval-Augmented Generation) application built on top of FastAPI and React. It allows users to convert YouTube videos into searchable local knowledge bases.



## 🌟 Features

*   **YouTube Transcript Ingestion:** Fetch and chunk transcripts directly from YouTube URLs.
*   **Semantic Cosine Similarity Search:** Custom lightweight, persistent vector database built around Chroma DB and LangChain.
*   **Local LLM QA:** Answer questions about the video context using ChatOllama (`llama3.2`).
*   **Timestamp-Linked Previews:** Click on source timestamps in the chat to jump directly to that point in the embedded YouTube video.
*   **Auto-Summarization:** Generate structured summaries containing main overviews, key takeaways, and topics lists.
*   **Document Context Cross-referencing:** Upload PDFs or TXT notes to query context across both files and videos.

## 🛠️ How to Run

### 1. Prerequisites
Ensure you have Node.js, Python 3.10+, and Ollama installed. Run the local models using:
```bash
ollama run llama3.2
ollama run nomic-embed-text
```

### 2. Run Backend
Navigate to the `backend` folder, set up your `.env` configuration file, and run:
```bash
cd backend
python -m venv .venv
# Activate virtualenv (e.g. .venv\Scripts\activate on Windows)
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Run Frontend
In a separate terminal, navigate to the `frontend` folder and run:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.
