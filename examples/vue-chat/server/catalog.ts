// Re-export the shared catalog from the frontend lib directory.
// The same Zod schema drives both the AI system prompt and the Vue registry.
export { chatCatalog } from "../src/lib/catalog.js";
export type { ChatCatalog } from "../src/lib/catalog.js";
