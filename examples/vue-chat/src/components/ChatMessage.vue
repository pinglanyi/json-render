<script setup lang="ts">
/**
 * ChatMessage — renders a single chat message.
 *
 * For user messages: a simple right-aligned bubble.
 * For assistant messages: renders text prose + an AI-generated UI spec
 *   (via @json-render/vue Renderer) side-by-side where the AI placed it.
 *
 * The spec is reconstructed from "data-spec" parts by replaying JSON Patch
 * operations through createSpecStreamCompiler.
 */
import { computed } from "vue";
import { Renderer, JSONUIProvider } from "@json-render/vue";
import type { ChatMessage } from "../lib/useChat.js";
import { components } from "../lib/registry.js";
import { chatCatalog } from "../lib/catalog.js";
import { useSpecFromParts } from "../lib/useSpecFromParts.js";
import { defineRegistry } from "@json-render/vue";

const props = defineProps<{
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
}>();

// Build the registry once (outside render)
const { registry } = defineRegistry(chatCatalog, { components });

// Reactive spec, rebuilt each time message parts change
const specParts = computed(() => props.message.parts);
const spec = useSpecFromParts(specParts);
const hasSpec = computed(() => spec.value !== null);

// Collect text parts into a single string
const text = computed(() =>
  props.message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join(""),
);

const isUser = computed(() => props.message.role === "user");
const showLoader = computed(
  () =>
    props.isLast &&
    props.isStreaming &&
    !isUser.value &&
    !text.value &&
    !hasSpec.value,
);
</script>

<template>
  <!-- User bubble: right-aligned -->
  <div v-if="isUser" class="user-bubble-wrapper">
    <div class="user-bubble">{{ text }}</div>
  </div>

  <!-- Assistant message: text + rendered UI -->
  <div v-else class="assistant-message">
    <!-- Loading shimmer -->
    <div v-if="showLoader" class="loading-text">Thinking…</div>

    <!-- Prose text -->
    <div v-if="text" class="prose-text">{{ text }}</div>

    <!-- AI-generated UI spec -->
    <div v-if="hasSpec" class="spec-wrapper">
      <JSONUIProvider :registry="registry">
        <Renderer
          :spec="spec"
          :loading="isLast && isStreaming"
        />
      </JSONUIProvider>
    </div>
  </div>
</template>

<style scoped>
/* User bubble */
.user-bubble-wrapper {
  display: flex;
  justify-content: flex-end;
}
.user-bubble {
  max-width: 75%;
  background: #3b82f6;
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Assistant */
.assistant-message {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}

.loading-text {
  font-size: 13px;
  color: #9ca3af;
  animation: shimmer 1.4s ease-in-out infinite;
}

.prose-text {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Rendered spec panel */
.spec-wrapper {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  overflow: auto;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
