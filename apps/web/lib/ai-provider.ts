import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * OpenAI-compatible provider configured via environment variables.
 *
 * Supports:
 * - Custom proxy relays (e.g. https://api.nuwaapi.com/v1)
 * - vLLM OpenAI-compatible endpoints
 * - Any OpenAI-compatible API
 *
 * Environment variables:
 *   OPENAI_API_KEY   - API key for the provider (required)
 *   OPENAI_BASE_URL  - Base URL of the proxy/endpoint
 *                      Default: https://api.nuwaapi.com/v1
 *   AI_MODEL         - Model ID to use
 *                      Default: gpt-4o-mini
 */
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.nuwaapi.com/v1",
});

export const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Returns the configured model instance using the Chat Completions API
 * (/v1/chat/completions). This ensures compatibility with DeepSeek, vLLM,
 * NUWA, and other OpenAI-compatible providers that do NOT implement the
 * newer OpenAI Responses API (/responses).
 */
export function getModel(modelId?: string): LanguageModel {
  return openaiProvider.chat(modelId ?? process.env.AI_MODEL ?? DEFAULT_MODEL);
}
