import { createOpenAI } from "@ai-sdk/openai";

/**
 * Returns an AI model compatible with the AI SDK.
 *
 * Reads from environment variables:
 *   OPENAI_API_KEY   — key for api.openai.com (default)
 *   OPENAI_BASE_URL  — custom base URL (for OpenAI-compatible providers)
 *   OPENAI_MODEL     — model name (default: gpt-4o-mini)
 */
export function getModel() {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "sk-placeholder",
    baseURL: process.env.OPENAI_BASE_URL,
  });
  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}
