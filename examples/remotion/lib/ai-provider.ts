import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * OpenAI-compatible provider configured via environment variables.
 *
 * Environment variables:
 *   OPENAI_API_KEY   - API key (required)
 *   OPENAI_BASE_URL  - Proxy base URL — MUST include /v1
 *                      e.g. https://api.deepseek.com/v1
 *   AI_MODEL         - Model ID (default: gpt-4o-mini)
 */
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  baseURL: process.env.OPENAI_BASE_URL ?? "https://api.nuwaapi.com/v1",
});

export const DEFAULT_MODEL = "gpt-4o-mini";

export function getModel(modelId?: string): LanguageModel {
  return openaiProvider.chat(modelId ?? process.env.AI_MODEL ?? DEFAULT_MODEL);
}
