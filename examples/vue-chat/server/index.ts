/**
 * Express API server for the vue-chat demo.
 *
 * POST /api/generate  — accepts a UIMessage array, runs the agent, and streams
 *                       back a UIMessageStream (text + spec data parts).
 *
 * In development the Vite dev server (port 5174) proxies /api to this server
 * (port 3002). In production, serve the Vite build with express.static.
 */
import express from "express";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import { agent } from "./agent.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3002);

app.use(express.json());

// CORS for development (Vite dev server → Express)
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options("*", (_req, res) => res.sendStatus(204));

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------
app.post("/api/generate", async (req, res) => {
  try {
    const uiMessages: UIMessage[] = req.body.messages;

    if (!Array.isArray(uiMessages) || uiMessages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const modelMessages = await convertToModelMessages(uiMessages);
    const result = await agent.stream({ messages: modelMessages });

    // pipeJsonRender intercepts the AI SDK text stream, extracts JSONL patch
    // lines, and re-emits them as "data-spec" parts — exactly what the Vue
    // frontend expects to reconstruct the spec progressively.
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(pipeJsonRender(result.toUIMessageStream()));
      },
    });

    const response = createUIMessageStreamResponse({ stream });

    // Forward headers (content-type, transfer-encoding, etc.)
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(response.status);

    // Pipe the response body to Express's res
    const reader = response.body!.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      await pump();
    };
    await pump();
  } catch (err) {
    console.error("[api/generate] Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[api] Listening on http://localhost:${PORT}`);
});
