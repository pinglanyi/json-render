# Deep RAG × deepagents

Full-stack RAG demo: Python [deepagents](https://github.com/deepagents/deepagents) backend + Next.js frontend with [json-render](https://github.com/pinglanyi/json-render) visualization.

## Architecture

```
User → Next.js Frontend (/api/proxy)
     → Python Backend (FastAPI + deepagents + LangGraph)
     → RAGFlow knowledge base
```

The Python agent queries RAGFlow, then writes its answer as prose + a ` ```spec ` JSONL fence that the frontend promotes to a rendered `RAGRenderer` card.

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # fill in keys
uv sync
uv run python main.py
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DEEP_RAG_MODEL` | LLM model name (e.g. `deepseek-chat`) |
| `DEEP_RAG_API_KEY` | LLM API key |
| `DEEP_RAG_BASE_URL` | LLM base URL |
| `RAGFLOW_BASE_URL` | RAGFlow server URL |
| `RAGFLOW_API_KEY` | RAGFlow API key |
| `RAGFLOW_PRODUCT_KB` | Substring to match product KB name |
| `RAGFLOW_IMAGE_KB` | Substring to match image KB name |
| `RAGFLOW_FILE_KB` | Substring to match file KB name |
| `RAGFLOW_VIDEO_KB` | Substring to match video KB name |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `BACKEND_URL` | Python backend URL (default: `http://localhost:8000`) |
