/**
 * RAGFlow tools for the Deep RAG frontend agent.
 *
 * Uses a closure-based per-request chunk buffer so concurrent requests
 * don't interfere with each other.
 */

import { tool } from "ai";
import { z } from "zod";

const RAGFLOW_BASE =
  (process.env.RAGFLOW_BASE_URL ?? "http://localhost:9380").replace(/\/$/, "");
const RAGFLOW_KEY = process.env.RAGFLOW_API_KEY ?? "";

const PRODUCT_KB = process.env.RAGFLOW_PRODUCT_KB ?? "product";
const IMAGE_KB = process.env.RAGFLOW_IMAGE_KB ?? "image";
const FILE_KB = process.env.RAGFLOW_FILE_KB ?? "file";
const VIDEO_KB = process.env.RAGFLOW_VIDEO_KB ?? "video";

function ragflowHeaders() {
  return {
    Authorization: `Bearer ${RAGFLOW_KEY}`,
    "Content-Type": "application/json",
  };
}

function fmtChunk(chunk: Record<string, unknown>, rank: number): string {
  const content = String(chunk.content ?? "").trim();
  const doc = String(
    chunk.document_keyword ?? chunk.doc_name ?? "Unknown",
  );
  const score = Number(chunk.similarity ?? 0).toFixed(3);
  const id = String(chunk.id ?? `idx-${rank}`);
  const meta = (
    chunk.meta_fields ??
    chunk.document_meta_fields ??
    {}
  ) as Record<string, unknown>;
  const metaStr = Object.keys(meta).length
    ? `meta: ${JSON.stringify(meta)} | `
    : "";
  return (
    `### Chunk ${rank} | score=${score} | ${metaStr}source=${doc}\n` +
    `id: ${id}\n\n${content}\n\n---`
  );
}

function kbNameFor(kbType: string): string {
  const map: Record<string, string> = {
    product: PRODUCT_KB,
    image: IMAGE_KB,
    file: FILE_KB,
    video: VIDEO_KB,
  };
  return map[kbType] ?? kbType;
}

// ---------------------------------------------------------------------------
// Per-request buffer — created by createRAGFlowTools() for each request
// ---------------------------------------------------------------------------

interface ChunkBuffer {
  chunks: Array<Record<string, unknown>>;
  offset: number;
  question: string;
  page: number;
  loaded: boolean;
}

export function createRAGFlowTools() {
  const buf: ChunkBuffer = {
    chunks: [],
    offset: 0,
    question: "",
    page: 1,
    loaded: false,
  };

  // ── List all datasets ───────────────────────────────────────────────────

  const ragflowListDatasets = tool({
    description:
      "List all available knowledge-base datasets in RAGFlow. Use when you need an overview of all datasets or when getKbDatasetsByType() returns nothing.",
    parameters: z.object({
      nameFilter: z
        .string()
        .optional()
        .describe("Optional substring to filter dataset names (case-insensitive)"),
    }),
    execute: async ({ nameFilter = "" }) => {
      try {
        const resp = await fetch(
          `${RAGFLOW_BASE}/api/v1/datasets?page=1&page_size=100`,
          { headers: ragflowHeaders() },
        );
        const data = (await resp.json()) as {
          code: number;
          message?: string;
          data?: Array<Record<string, unknown>>;
        };
        if (data.code !== 0) return `RAGFlow API error: ${data.message}`;

        let datasets = data.data ?? [];
        if (nameFilter) {
          datasets = datasets.filter((d) =>
            String(d.name ?? "")
              .toLowerCase()
              .includes(nameFilter.toLowerCase()),
          );
        }
        if (!datasets.length)
          return "No datasets found. Create a knowledge base first.";

        const rows = datasets.map(
          (d) =>
            `| \`${d.id}\` | ${d.name} | ${d.document_count ?? d.doc_num ?? "?"} | ${d.chunk_count ?? d.chunk_num ?? "?"} |`,
        );
        return [
          `## Available RAGFlow Datasets (${datasets.length} found)\n`,
          "| ID | Name | Documents | Chunks |",
          "|----|------|-----------|--------|",
          ...rows,
          "\nUse the **ID** column values as `datasetIds` in ragflowRetrieve().",
        ].join("\n");
      } catch (err) {
        return `RAGFlow request failed: ${err}`;
      }
    },
  });

  // ── Get datasets by KB type ─────────────────────────────────────────────

  const getKbDatasetsByType = tool({
    description:
      "Get RAGFlow dataset IDs for a specific knowledge base type (product/image/file/video). Use this when the user's intent is clear.",
    parameters: z.object({
      kbType: z
        .enum(["product", "image", "file", "video"])
        .describe(
          "product=Q&A specs | image=photos/drawings | file=manuals/PDFs | video=tutorials",
        ),
    }),
    execute: async ({ kbType }) => {
      const nameFilter = kbNameFor(kbType);
      try {
        const resp = await fetch(
          `${RAGFLOW_BASE}/api/v1/datasets?page=1&page_size=100`,
          { headers: ragflowHeaders() },
        );
        const data = (await resp.json()) as {
          code: number;
          message?: string;
          data?: Array<Record<string, unknown>>;
        };
        if (data.code !== 0) return `RAGFlow API error: ${data.message}`;

        const all = data.data ?? [];
        const matched = all.filter((d) =>
          String(d.name ?? "")
            .toLowerCase()
            .includes(nameFilter.toLowerCase()),
        );

        if (!matched.length) {
          const names = all.map((d) => d.name);
          return (
            `No dataset found with '${nameFilter}' in its name.\n` +
            `Available: ${JSON.stringify(names)}\n\n` +
            "Pick the closest match or call ragflowListDatasets() for full details."
          );
        }

        const rows = matched.map(
          (d) =>
            `| \`${d.id}\` | ${d.name} | ${d.document_count ?? d.doc_num ?? "?"} | ${d.chunk_count ?? d.chunk_num ?? "?"} |`,
        );
        return [
          `## ${kbType.charAt(0).toUpperCase() + kbType.slice(1)} KB Datasets (${matched.length} found)\n`,
          "| ID | Name | Documents | Chunks |",
          "|----|------|-----------|--------|",
          ...rows,
          "\nUse these IDs as `datasetIds` in ragflowRetrieve().",
        ].join("\n");
      } catch (err) {
        return `RAGFlow request failed: ${err}`;
      }
    },
  });

  // ── Retrieve chunks ─────────────────────────────────────────────────────

  const ragflowRetrieve = tool({
    description:
      "Retrieve a batch of chunks from RAGFlow for a question. Returns the top-k most relevant chunks and buffers the rest for getNextChunks().",
    parameters: z.object({
      question: z.string().describe("The search query"),
      datasetIds: z.array(z.string()).describe("One or more dataset IDs"),
      topK: z.number().optional().describe("Chunks to return immediately (default 6)"),
      batchSize: z.number().optional().describe("Total chunks to fetch (default 32)"),
      page: z.number().optional().describe("Pagination index, start at 1"),
      modelFilter: z
        .string()
        .optional()
        .describe("Filter by model number in meta_fields (product KB only)"),
    }),
    execute: async ({
      question,
      datasetIds,
      topK = 6,
      batchSize = 32,
      page = 1,
      modelFilter = "",
    }) => {
      const payload: Record<string, unknown> = {
        question,
        dataset_ids: datasetIds,
        top_k: batchSize,
        similarity_threshold: 0.2,
        vector_similarity_weight: 0.3,
        page,
        page_size: batchSize,
        highlight: false,
      };
      if (modelFilter) {
        payload.condition = { fields: { model: modelFilter } };
      }

      try {
        const resp = await fetch(`${RAGFLOW_BASE}/api/v1/retrieval`, {
          method: "POST",
          headers: ragflowHeaders(),
          body: JSON.stringify(payload),
        });
        const data = (await resp.json()) as {
          code: number;
          message?: string;
          data?: { chunks?: Array<Record<string, unknown>>; total?: number };
        };
        if (data.code !== 0) return `RAGFlow API error: ${data.message}`;

        let chunks = data.data?.chunks ?? [];
        const total = data.data?.total ?? chunks.length;

        if (!chunks.length)
          return "[ragflowRetrieve] No chunks found. Check datasetIds or rephrase the query.";

        chunks.sort(
          (a, b) => Number(b.similarity ?? 0) - Number(a.similarity ?? 0),
        );

        if (modelFilter) {
          const ml = modelFilter.toLowerCase();
          const match = (c: Record<string, unknown>) => {
            const meta = JSON.stringify(
              c.meta_fields ?? c.document_meta_fields ?? {},
            ).toLowerCase();
            const name = String(
              c.doc_name ?? c.document_keyword ?? "",
            ).toLowerCase();
            return meta.includes(ml) || name.includes(ml);
          };
          const filtered = chunks.filter(match);
          if (filtered.length) {
            chunks = [...filtered, ...chunks.filter((c) => !match(c))];
          }
        }

        buf.chunks = chunks;
        buf.offset = topK;
        buf.question = question;
        buf.page = page;
        buf.loaded = true;

        const top = chunks.slice(0, topK);
        const remaining = chunks.length - topK;
        const filterNote = modelFilter ? ` (filtered by model='${modelFilter}')` : "";

        return [
          `## RAGFlow results for: '${question}'${filterNote}  (page=${page})\n`,
          `Fetched ${chunks.length} chunks (total in index: ${total}).`,
          `Showing top ${top.length} — ${remaining} more buffered.\n`,
          ...top.map((c, i) => fmtChunk(c, i + 1)),
          remaining > 0
            ? `\n**${remaining} chunks remain** — call getNextChunks() for more.`
            : `\nAll chunks shown. Call ragflowRetrieve with page=${page + 1} for more.`,
        ].join("\n");
      } catch (err) {
        return `RAGFlow request failed: ${err}`;
      }
    },
  });

  // ── Get next chunks from buffer ─────────────────────────────────────────

  const getNextChunks = tool({
    description:
      "Return the next batch of chunks from the in-memory buffer (no extra API call). Call after ragflowRetrieve() when more evidence is needed.",
    parameters: z.object({
      topK: z.number().optional().describe("Number of additional chunks to pop (default 5)"),
    }),
    execute: async ({ topK = 5 }) => {
      if (!buf.loaded) return "Buffer is empty — call ragflowRetrieve() first.";
      const { chunks, offset } = buf;
      if (offset >= chunks.length) {
        return (
          `Buffer exhausted (${chunks.length} chunks processed). ` +
          `Call ragflowRetrieve(page=${buf.page + 1}) for a fresh batch.`
        );
      }
      const end = Math.min(offset + topK, chunks.length);
      const next = chunks.slice(offset, end);
      buf.offset = end;
      const remaining = chunks.length - end;

      return [
        `## Next chunks from buffer (#${offset + 1}–#${end})\n`,
        ...next.map((c, i) => fmtChunk(c, offset + i + 1)),
        remaining > 0
          ? `\n**${remaining} chunks still in buffer** — call getNextChunks() for more.`
          : `\nBuffer exhausted. Call ragflowRetrieve(page=${buf.page + 1}) for fresh results.`,
      ].join("\n");
    },
  });

  return { ragflowListDatasets, getKbDatasetsByType, ragflowRetrieve, getNextChunks };
}
