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


### bug fix:

```markdown
# Monorepo 本地包找不到模块问题排查记录

## 问题描述

Next.js 前端启动报错：
```
Module not found: Can't resolve '@json-render/core'
Module not found: Can't resolve '@json-render/react'
Module not found: Can't resolve '@json-render/shadcn'
```

## 根本原因

项目是 pnpm workspace monorepo，`@json-render/*` 是本地包，引用方式为 `workspace:*`。
本地包需要先编译生成 `dist`，Next.js 才能解析到。

## 解决步骤

### 1. 不能用 npm 直接安装
```bash
# ❌ 错误：npm 不支持 workspace:* 协议
npm install @json-render/core @json-render/react
```

### 2. 在根目录用 pnpm 安装依赖
```bash
cd /path/to/json-render  # 项目根目录
pnpm install
```

### 3. 构建本地包
```bash
pnpm --filter @json-render/core build
pnpm --filter @json-render/react build
pnpm --filter @json-render/shadcn build
```

### 4. 启动前端
```bash
cd examples/deep_rag_deepagents/frontend
pnpm dev
```

## 关键点

- `workspace:*` 是 pnpm workspace 协议，只能用 pnpm 管理，不能用 npm/yarn 直接安装
- 本地包必须先 build 生成 `dist`，Next.js 才能 resolve
- `pnpm dev`（turbo 全量启动）会因为部分包环境缺失而静默失败，应单独 build 需要的包排查问题
- 排查时先进单个包目录执行 `pnpm dev` 确认是否能正常编译
```
