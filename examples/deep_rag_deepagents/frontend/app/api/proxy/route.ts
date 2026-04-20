/**
 * Proxy route — adapts the Python deepagents SSE stream to json-render format.
 *
 * Flow:
 *   Client → POST /api/proxy?threadId=<id>
 *         → Python backend POST /chat/stream  (SSE: {"text":"..."}, {"done":true})
 *         → sseToStreamChunks()               (StreamChunk: text-start/delta/end)
 *         → pipeJsonRender()                  (classifies JSONL specs vs prose)
 *         → createUIMessageStreamResponse()   (AI SDK UIMessageStream)
 *         → Client renders with RAGRenderer
 */

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { pipeJsonRender, type StreamChunk } from "@json-render/core";

const BACKEND_URL = (
  process.env.BACKEND_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// SSE → StreamChunk adapter
// ---------------------------------------------------------------------------

/**
 * Converts the Python backend's SSE stream ({"text":"..."} events) to the
 * StreamChunk format that pipeJsonRender / createJsonRenderTransform expects.
 *
 * The Python agent embeds json-render JSONL inside ```spec fences in the text.
 * pipeJsonRender will detect the fences and promote those lines to spec-data
 * parts, leaving the rest as prose text-delta parts.
 */
function sseToStreamChunks(
  sseBody: ReadableStream<Uint8Array>,
): ReadableStream<StreamChunk> {
  return new ReadableStream<StreamChunk>({
    async start(controller) {
      const reader = sseBody.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const textId = "proxy-t1";
      let blockOpen = false;

      const openBlock = () => {
        if (!blockOpen) {
          controller.enqueue({ type: "text-start", id: textId });
          blockOpen = true;
        }
      };

      try {
        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let ev: Record<string, unknown>;
            try {
              ev = JSON.parse(raw);
            } catch {
              continue;
            }

            if (typeof ev.text === "string" && ev.text) {
              openBlock();
              controller.enqueue({
                type: "text-delta",
                id: textId,
                delta: ev.text,
              });
            }
            if (ev.done || ev.error) break outer;
          }
        }
      } finally {
        if (blockOpen) controller.enqueue({ type: "text-end", id: textId });
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const url = new URL(req.url);
  const threadId = url.searchParams.get("threadId") ?? "default";

  const body = await req.json();
  const uiMessages: UIMessage[] = body.messages;

  if (!uiMessages?.length) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract the last user message text
  const lastMsg = uiMessages[uiMessages.length - 1];
  const text =
    lastMsg.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("") ?? "";

  // Call the Python deepagents backend
  let backendResp: Response;
  try {
    backendResp = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, thread_id: threadId }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Backend unreachable: ${err}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!backendResp.ok || !backendResp.body) {
    return new Response(
      JSON.stringify({ error: `Backend error ${backendResp.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  // Convert SSE → StreamChunks → pipeJsonRender → UIMessageStream
  const chunkStream = sseToStreamChunks(backendResp.body);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(chunkStream));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
