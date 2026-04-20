"""RAGFlow tools — TypeScript 版（deep_rag/frontend）的 Python 对应实现。

逐步披露模式：一次取大批 chunks，逐步返回给 LLM，减少 API 调用。
"""
from __future__ import annotations

import json
import os
from typing import Any, Literal

import httpx
from langchain_core.tools import tool

_RAGFLOW_BASE = os.getenv("RAGFLOW_BASE_URL", "http://localhost:9380").rstrip("/")
_RAGFLOW_KEY = os.getenv("RAGFLOW_API_KEY", "")

_PRODUCT_KB = os.getenv("RAGFLOW_PRODUCT_KB", "product")
_IMAGE_KB = os.getenv("RAGFLOW_IMAGE_KB", "image")
_FILE_KB = os.getenv("RAGFLOW_FILE_KB", "file")
_VIDEO_KB = os.getenv("RAGFLOW_VIDEO_KB", "video")

# ---------------------------------------------------------------------------
# Global chunk buffer (per-process; 单进程单用户演示 OK)
# ---------------------------------------------------------------------------

_buf: dict[str, Any] = {
    "chunks": [],
    "offset": 0,
    "page": 1,
    "loaded": False,
}


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_RAGFLOW_KEY}",
        "Content-Type": "application/json",
    }


def _kb_name(kb_type: str) -> str:
    return {"product": _PRODUCT_KB, "image": _IMAGE_KB, "file": _FILE_KB, "video": _VIDEO_KB}.get(
        kb_type, kb_type
    )


def _fmt_chunk(chunk: dict, rank: int) -> str:
    content = str(chunk.get("content", "")).strip()
    doc = str(chunk.get("document_keyword") or chunk.get("doc_name") or "Unknown")
    score = float(chunk.get("similarity", 0.0))
    chunk_id = str(chunk.get("id", f"idx-{rank}"))
    meta = chunk.get("meta_fields") or chunk.get("document_meta_fields") or {}
    meta_str = f"meta: {json.dumps(meta, ensure_ascii=False)} | " if meta else ""
    return (
        f"### Chunk {rank} | score={score:.3f} | {meta_str}source={doc}\n"
        f"id: {chunk_id}\n\n{content}\n\n---"
    )


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------


@tool(parse_docstring=True)
def ragflow_list_datasets(name_filter: str = "") -> str:
    """列出 RAGFlow 中所有可用知识库数据集。

    当意图不明确，或 get_kb_datasets_by_type() 无结果时使用。

    Args:
        name_filter: 可选的名称过滤子串（不区分大小写）。传 "" 列出全部。

    Returns:
        包含 ID、名称、文档数、chunk 数的表格。
    """
    try:
        resp = httpx.get(
            f"{_RAGFLOW_BASE}/api/v1/datasets",
            headers=_headers(),
            params={"page": 1, "page_size": 100},
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:  # noqa: BLE001
        return f"RAGFlow 请求失败: {exc}"

    if data.get("code") != 0:
        return f"RAGFlow API 错误: {data.get('message')}"

    datasets: list[dict] = data.get("data", [])
    if name_filter:
        datasets = [d for d in datasets if name_filter.lower() in d.get("name", "").lower()]
    if not datasets:
        return "未找到数据集，请先在 RAGFlow 中创建知识库。"

    lines = [
        f"## 可用数据集 ({len(datasets)} 个)\n",
        "| ID | 名称 | 文档数 | Chunk 数 |",
        "|----|------|--------|----------|",
    ]
    for d in datasets:
        lines.append(
            f"| `{d.get('id', '—')}` | {d.get('name', '—')} "
            f"| {d.get('document_count', d.get('doc_num', '?'))} "
            f"| {d.get('chunk_count', d.get('chunk_num', '?'))} |"
        )
    lines.append("\n将 **ID** 列的值作为 `dataset_ids` 传给 ragflow_retrieve()。")
    return "\n".join(lines)


@tool(parse_docstring=True)
def get_kb_datasets_by_type(
    kb_type: Literal["product", "image", "file", "video"],
) -> str:
    """按知识库类型获取 RAGFlow 数据集 ID。意图明确时优先使用此工具。

    Args:
        kb_type: product=产品Q&A | image=图片 | file=文件/PDF | video=视频

    Returns:
        匹配的数据集 ID 和名称表格。
    """
    name_filter = _kb_name(kb_type)
    try:
        resp = httpx.get(
            f"{_RAGFLOW_BASE}/api/v1/datasets",
            headers=_headers(),
            params={"page": 1, "page_size": 100},
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:  # noqa: BLE001
        return f"RAGFlow 请求失败: {exc}"

    if data.get("code") != 0:
        return f"RAGFlow API 错误: {data.get('message')}"

    datasets: list[dict] = data.get("data", [])
    matched = [d for d in datasets if name_filter.lower() in d.get("name", "").lower()]

    if not matched:
        all_names = [d.get("name", "") for d in datasets]
        return (
            f"未找到包含 '{name_filter}' 的数据集。\n"
            f"可用数据集: {all_names}\n\n"
            "请选择最接近的，或调用 ragflow_list_datasets() 查看完整列表。"
        )

    lines = [
        f"## {kb_type} KB 数据集 ({len(matched)} 个)\n",
        "| ID | 名称 | 文档数 | Chunk 数 |",
        "|----|------|--------|----------|",
    ]
    for d in matched:
        lines.append(
            f"| `{d.get('id', '—')}` | {d.get('name', '—')} "
            f"| {d.get('document_count', d.get('doc_num', '?'))} "
            f"| {d.get('chunk_count', d.get('chunk_num', '?'))} |"
        )
    lines.append("\n将这些 ID 作为 `dataset_ids` 传给 ragflow_retrieve()。")
    return "\n".join(lines)


@tool(parse_docstring=True)
def ragflow_retrieve(
    question: str,
    dataset_ids: list[str],
    top_k: int = 6,
    batch_size: int = 32,
    page: int = 1,
    model_filter: str = "",
) -> str:
    """从 RAGFlow 检索 chunks，返回最相关的 top_k 条，其余存入缓冲区。

    Args:
        question: 发送给 RAGFlow 的检索问题。
        dataset_ids: 一个或多个知识库 dataset ID。
        top_k: 立即返回给 LLM 的 chunk 数量（默认 6）。
        batch_size: 每次从 RAGFlow 获取的总 chunk 数（默认 32）。
        page: 分页索引，从 1 开始。
        model_filter: 按 meta_fields 中的型号过滤（仅 product KB）。

    Returns:
        top_k 个 chunks 的格式化文本，含评分和来源。
    """
    payload: dict[str, Any] = {
        "question": question,
        "dataset_ids": dataset_ids,
        "top_k": batch_size,
        "similarity_threshold": 0.2,
        "vector_similarity_weight": 0.3,
        "page": page,
        "page_size": batch_size,
        "highlight": False,
    }
    if model_filter:
        payload["condition"] = {"fields": {"model": model_filter}}

    try:
        resp = httpx.post(
            f"{_RAGFLOW_BASE}/api/v1/retrieval",
            headers=_headers(),
            json=payload,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:  # noqa: BLE001
        return f"RAGFlow 请求失败: {exc}"

    if data.get("code") != 0:
        return f"RAGFlow API 错误: {data.get('message')}"

    chunks: list[dict] = data.get("data", {}).get("chunks", [])
    total: int = data.get("data", {}).get("total", len(chunks))

    if not chunks:
        return "[ragflow_retrieve] 未找到 chunks，请检查 dataset_ids 或换一种表述。"

    chunks.sort(key=lambda c: float(c.get("similarity", 0.0)), reverse=True)

    if model_filter:
        ml = model_filter.lower()

        def _match(c: dict) -> bool:
            meta_str = json.dumps(
                c.get("meta_fields") or c.get("document_meta_fields") or {}, ensure_ascii=False
            ).lower()
            doc_name = str(c.get("doc_name") or c.get("document_keyword") or "").lower()
            return ml in meta_str or ml in doc_name

        filtered = [c for c in chunks if _match(c)]
        if filtered:
            chunks = filtered + [c for c in chunks if not _match(c)]

    _buf["chunks"] = chunks
    _buf["offset"] = top_k
    _buf["page"] = page
    _buf["loaded"] = True

    top = chunks[:top_k]
    remaining = len(chunks) - top_k
    filter_note = f" (已按型号 '{model_filter}' 过滤)" if model_filter else ""

    lines = [
        f"## RAGFlow 检索结果：'{question}'{filter_note}  (page={page})\n",
        f"共获取 {len(chunks)} 个 chunks（RAGFlow 索引总计 {total} 条）。",
        f"显示前 {len(top)} 条 — {remaining} 条已存入缓冲区。\n",
        *[_fmt_chunk(c, i + 1) for i, c in enumerate(top)],
    ]
    if remaining > 0:
        lines.append(f"\n**{remaining} 条 chunks 在缓冲区** — 调用 get_next_chunks() 获取更多。")
    else:
        lines.append(f"\n所有 chunks 已显示。如需更多，调用 ragflow_retrieve(page={page + 1})。")
    return "\n".join(lines)


@tool(parse_docstring=True)
def get_next_chunks(top_k: int = 5) -> str:
    """从内存缓冲区获取下一批 chunks（不产生额外 API 调用）。

    在 ragflow_retrieve() 后调用，逐步获取更多证据。

    Args:
        top_k: 从缓冲区弹出的 chunk 数量（默认 5）。

    Returns:
        下一批 chunks 的格式化文本，含剩余数量。
    """
    if not _buf.get("loaded"):
        return "缓冲区为空 — 请先调用 ragflow_retrieve()。"

    chunks = _buf["chunks"]
    offset = _buf["offset"]

    if offset >= len(chunks):
        return (
            f"缓冲区已耗尽（已处理 {len(chunks)} 条）。"
            f"调用 ragflow_retrieve(page={_buf['page'] + 1}) 获取新的一批。"
        )

    end = min(offset + top_k, len(chunks))
    next_batch = chunks[offset:end]
    _buf["offset"] = end
    remaining = len(chunks) - end

    lines = [
        f"## 缓冲区 chunks (#{offset + 1}–#{end})\n",
        *[_fmt_chunk(c, offset + i + 1) for i, c in enumerate(next_batch)],
    ]
    if remaining > 0:
        lines.append(f"\n**{remaining} 条仍在缓冲区** — 调用 get_next_chunks() 继续获取。")
    else:
        lines.append(
            f"\n缓冲区已耗尽。调用 ragflow_retrieve(page={_buf['page'] + 1}) 获取新结果。"
        )
    return "\n".join(lines)
