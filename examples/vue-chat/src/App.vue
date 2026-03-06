<script setup lang="ts">
/**
 * App.vue — root component for the json-render Vue chat demo.
 *
 * Architecture overview:
 *   1. useChat() manages message state and streams from POST /api/generate.
 *   2. Each assistant message contains text parts + "data-spec" parts.
 *   3. ChatMessage.vue renders text as prose and spec parts via the Vue
 *      Renderer from @json-render/vue.
 *   4. The backend (server/index.ts) runs a ToolLoopAgent and pipes the
 *      AI stream through pipeJsonRender(), which converts JSONL patch lines
 *      into "data-spec" SSE chunks that the frontend reassembles.
 */
import { ref, nextTick, watch } from "vue";
import ChatMessage from "./components/ChatMessage.vue";
import { useChat } from "./lib/useChat.js";

const { messages, isStreaming, error, sendMessage, clearMessages } = useChat();

const input = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

const SUGGESTIONS = [
  { label: "Explain black holes", prompt: "Explain black holes with a rich visual dashboard" },
  { label: "Python vs JavaScript", prompt: "Compare Python and JavaScript as programming languages" },
  { label: "History of the internet", prompt: "Give me a visual timeline of the history of the internet" },
  { label: "World's tallest buildings", prompt: "Show me the world's 10 tallest buildings with a comparison chart" },
];

async function handleSubmit(text?: string) {
  const msg = text ?? input.value;
  if (!msg.trim() || isStreaming.value) return;
  input.value = "";
  await sendMessage(msg);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    void handleSubmit();
  }
}

// Auto-scroll to bottom when new content arrives
watch(messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <span class="header-logo">⬡</span>
        <h1 class="header-title">json-render · Vue Chat</h1>
      </div>
      <button
        v-if="messages.length > 0"
        class="clear-btn"
        @click="clearMessages"
      >
        Start Over
      </button>
    </header>

    <!-- Messages -->
    <main ref="messagesContainer" class="messages-area">
      <!-- Empty state / suggestions -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-inner">
          <h2 class="empty-title">What would you like to explore?</h2>
          <p class="empty-subtitle">
            Ask anything — the AI will generate a visual dashboard from your question.
          </p>
          <div class="suggestions">
            <button
              v-for="s in SUGGESTIONS"
              :key="s.label"
              class="suggestion-chip"
              @click="handleSubmit(s.prompt)"
            >
              ✦ {{ s.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Message thread -->
      <div v-else class="message-thread">
        <ChatMessage
          v-for="(msg, i) in messages"
          :key="msg.id"
          :message="msg"
          :is-last="i === messages.length - 1"
          :is-streaming="isStreaming"
        />

        <!-- Error banner -->
        <div v-if="error" class="error-banner">{{ error }}</div>
      </div>
    </main>

    <!-- Input bar -->
    <footer class="input-bar">
      <div class="input-wrapper">
        <textarea
          v-model="input"
          :disabled="isStreaming"
          :placeholder="
            messages.length === 0
              ? 'e.g., Show me a dashboard about climate change…'
              : 'Ask a follow-up…'
          "
          rows="2"
          class="input-textarea"
          @keydown="handleKeydown"
        />
        <button
          class="send-btn"
          :disabled="!input.trim() || isStreaming"
          @click="handleSubmit()"
        >
          <span v-if="isStreaming" class="spinner">⟳</span>
          <span v-else>↑</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background: #f3f4f6;
  color: #111827;
  height: 100vh;
  overflow: hidden;
}
#app { height: 100vh; }
</style>

<style scoped>
/* ── App shell ─────────────────────────────────────────────────────────────── */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 0 1px #e5e7eb;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: white;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-logo {
  font-size: 20px;
  color: #3b82f6;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.clear-btn {
  padding: 5px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
}
.clear-btn:hover { background: #f3f4f6; }

/* ── Messages area ─────────────────────────────────────────────────────────── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}
.empty-inner {
  max-width: 520px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}
.empty-subtitle {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.suggestion-chip {
  padding: 7px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s;
}
.suggestion-chip:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

/* ── Message thread ────────────────────────────────────────────────────────── */
.message-thread {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Error ─────────────────────────────────────────────────────────────────── */
.error-banner {
  padding: 12px 16px;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
}

/* ── Input bar ─────────────────────────────────────────────────────────────── */
.input-bar {
  padding: 12px 20px 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}
.input-wrapper {
  position: relative;
  display: flex;
}
.input-textarea {
  flex: 1;
  resize: none;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 48px 12px 14px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  line-height: 1.5;
  background: #f9fafb;
  color: #111827;
  transition: border-color 0.15s, background 0.15s;
}
.input-textarea:focus {
  border-color: #93c5fd;
  background: white;
}
.input-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.send-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, opacity 0.15s;
}
.send-btn:hover:not(:disabled) { background: #2563eb; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.spinner {
  display: inline-block;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
