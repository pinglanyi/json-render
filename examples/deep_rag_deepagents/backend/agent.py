"""Agent factory — deepagents + json-render 集成。"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from langchain_openai import ChatOpenAI

from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from prompts import SYSTEM_PROMPT
from tools import get_kb_datasets_by_type, get_next_chunks, ragflow_list_datasets, ragflow_retrieve

_AGENT_DATA_DIR = Path(os.getenv("AGENT_DATA_DIR", "./agent_data")).resolve()


def _ensure_agents_md(data_dir: Path) -> None:
    agents_md = data_dir / "AGENTS.md"
    if not agents_md.exists():
        agents_md.write_text(
            "# Agent 长期记忆\n\n"
            "此文件在每次对话开始时自动加载。\n"
            "更新方式: read_file('/AGENTS.md') 然后 edit_file('/AGENTS.md', ...)\n\n"
            "## 用户偏好\n\n（尚未记录）\n\n"
            "## 领域知识\n\n（尚未记录）\n",
            encoding="utf-8",
        )


def create_agent(checkpointer: Any = None) -> Any:
    """构建并返回 deepagents RAG 智能体。"""
    _AGENT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    _ensure_agents_md(_AGENT_DATA_DIR)

    model_name = os.getenv("DEEP_RAG_MODEL", "deepseek-chat")
    kwargs: dict[str, Any] = {"model": model_name, "temperature": 0.0}
    if api_key := os.getenv("DEEP_RAG_API_KEY"):
        kwargs["api_key"] = api_key
    if base_url := os.getenv("DEEP_RAG_BASE_URL"):
        kwargs["base_url"] = base_url

    model = ChatOpenAI(**kwargs)
    backend = FilesystemBackend(root_dir=_AGENT_DATA_DIR, virtual_mode=True)

    return create_deep_agent(
        model=model,
        tools=[
            get_kb_datasets_by_type,
            ragflow_list_datasets,
            ragflow_retrieve,
            get_next_chunks,
        ],
        system_prompt=SYSTEM_PROMPT,
        backend=backend,
        memory=["/AGENTS.md"],
        checkpointer=checkpointer,
    )
