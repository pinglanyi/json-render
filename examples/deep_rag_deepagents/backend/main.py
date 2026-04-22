"""Deep RAG × deepagents — 简化版后端，专为 json-render 前端集成演示。

无需认证、无需 PostgreSQL；使用 LangGraph MemorySaver 维护对话历史。

启动：
    uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

API:
    POST /chat/stream   流式对话（SSE）
    GET  /health        健康检查
"""
from __future__ import annotations

import json
import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent import create_agent
from dotenv import load_dotenv
load_dotenv()

# ---------------------------------------------------------------------------
# App state
# ---------------------------------------------------------------------------

_state: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    from langgraph.checkpoint.memory import MemorySaver  # noqa: PLC0415

    cp = MemorySaver()
    _state["agent"] = create_agent(checkpointer=cp)
    yield


app = FastAPI(
    title="Deep RAG × deepagents",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    message: str
    thread_id: str = ""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _extract_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            p.get("text", "") if isinstance(p, dict) else str(p) for p in content
        )
    return str(content)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    """SSE 流格式:
    * ``data: {"text": "..."}``   — 增量 token
    * ``data: {"done": true}``    — 流结束
    * ``data: {"error": "..."}``  — 错误
    """
    agent = _state["agent"]
    thread_id = req.thread_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    async def _generate():
        try:
            async for event in agent.astream_events(
                {"messages": [{"role": "user", "content": req.message}]},
                config=config,
                version="v2",
            ):
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    text = _extract_text(getattr(chunk, "content", ""))
                    if text:
                        yield f"data: {json.dumps({'text': text})}\n\n"
        except Exception as exc:  # noqa: BLE001
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        finally:
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
