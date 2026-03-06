/**
 * useChat — a minimal Vue composable for streaming chat with the AI SDK
 * UIMessageStream protocol.
 *
 * Streams from POST /api/generate, parses the text-event-stream (SSE) data
 * lines emitted by `createUIMessageStreamResponse`, and reconstructs:
 *   - message.text  — conversational prose from the AI
 *   - message.parts — includes "data-spec" parts emitted by pipeJsonRender
 *
 * Each SSE data line is a JSON object like:
 *   {"type":"text-delta","id":"…","delta":"Hello"}          → text chunk
 *   {"type":"data-spec","data":{"type":"patch","patch":…}}  → spec patch
 *
 * This composable is framework-agnostic boilerplate; in a real app you could
 * use the official @ai-sdk/vue package instead.
 */
import { ref, readonly } from "vue";
import type { Ref } from "vue";
import { SPEC_DATA_PART_TYPE, type SpecDataPart } from "@json-render/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextPart {
  type: "text";
  text: string;
}

export interface SpecPart {
  type: typeof SPEC_DATA_PART_TYPE;
  data: SpecDataPart;
}

export interface ToolPart {
  type: string; // "tool-getWeather", etc.
  toolCallId: string;
  state: string;
  output?: unknown;
}

export type MessagePart = TextPart | SpecPart | ToolPart;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useChat(apiUrl = "/api/generate") {
  const messages: Ref<ChatMessage[]> = ref([]);
  const isStreaming: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  let msgCounter = 0;
  const nextId = () => `msg-${++msgCounter}`;

  // ── Send a message ─────────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming.value) return;

    error.value = null;

    // Append user message
    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      parts: [{ type: "text", text: text.trim() }],
    };
    messages.value = [...messages.value, userMsg];

    // Placeholder for the assistant message (filled in as stream arrives)
    const assistantId = nextId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      parts: [],
    };
    messages.value = [...messages.value, assistantMsg];
    isStreaming.value = true;

    try {
      // Build the UIMessage payload the server expects
      const payload = {
        messages: messages.value
          .filter((m) => m.id !== assistantId) // don't include the empty placeholder
          .map((m) => ({
            id: m.id,
            role: m.role,
            parts: m.parts,
          })),
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      // Read the text-event-stream
      await readStream(response.body, assistantId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
      // Remove the empty assistant placeholder on hard failures
      messages.value = messages.value.filter((m) => m.id !== assistantId);
    } finally {
      isStreaming.value = false;
    }
  }

  // ── Stream reader ──────────────────────────────────────────────────────────

  async function readStream(body: ReadableStream<Uint8Array>, assistantId: string) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Track the current open text part index for delta updates
    let currentTextPartIndex = -1;

    const updateAssistant = (updater: (msg: ChatMessage) => ChatMessage) => {
      messages.value = messages.value.map((m) =>
        m.id === assistantId ? updater(m) : m,
      );
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on newlines and process each SSE line
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;

          let chunk: Record<string, unknown>;
          try {
            chunk = JSON.parse(jsonStr) as Record<string, unknown>;
          } catch {
            // Not valid JSON — skip
            continue;
          }

          const type = chunk.type as string;

          if (type === "text-start") {
            // Start a new text part
            updateAssistant((msg) => {
              const newParts: MessagePart[] = [
                ...msg.parts,
                { type: "text", text: "" } as TextPart,
              ];
              currentTextPartIndex = newParts.length - 1;
              return { ...msg, parts: newParts };
            });
          } else if (type === "text-delta") {
            const delta = chunk.delta as string;
            updateAssistant((msg) => {
              if (currentTextPartIndex < 0) return msg;
              const parts = [...msg.parts];
              const part = parts[currentTextPartIndex];
              if (part?.type === "text") {
                parts[currentTextPartIndex] = {
                  ...part,
                  text: part.text + delta,
                };
              }
              return { ...msg, parts };
            });
          } else if (type === "text-end") {
            currentTextPartIndex = -1;
          } else if (type === SPEC_DATA_PART_TYPE) {
            // Spec patch — append as a spec part
            const data = chunk.data as SpecDataPart;
            updateAssistant((msg) => ({
              ...msg,
              parts: [
                ...msg.parts,
                { type: SPEC_DATA_PART_TYPE, data } as SpecPart,
              ],
            }));
          }
          // Other chunk types (step-start, step-finish, tool-*, etc.)
          // are ignored for this minimal demo.
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ── Clear ──────────────────────────────────────────────────────────────────

  function clearMessages() {
    messages.value = [];
    error.value = null;
  }

  return {
    messages: readonly(messages),
    isStreaming: readonly(isStreaming),
    error: readonly(error),
    sendMessage,
    clearMessages,
  };
}
