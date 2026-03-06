/**
 * useSpecFromParts — reconstructs a Spec from the "data-spec" parts in a
 * ChatMessage by replaying the RFC 6902 JSON Patch operations through
 * createSpecStreamCompiler.
 *
 * Used by ChatMessage.vue to render the AI-generated UI alongside the text.
 */
import { computed } from "vue";
import type { ComputedRef } from "vue";
import {
  createSpecStreamCompiler,
  SPEC_DATA_PART_TYPE,
  type Spec,
} from "@json-render/core";
import type { MessagePart, SpecPart } from "./useChat.js";

export function useSpecFromParts(
  partsRef: ComputedRef<MessagePart[]> | { value: MessagePart[] },
): ComputedRef<Spec | null> {
  return computed(() => {
    const parts = partsRef.value;
    const specParts = parts.filter(
      (p): p is SpecPart => p.type === SPEC_DATA_PART_TYPE,
    );

    if (specParts.length === 0) return null;

    const compiler = createSpecStreamCompiler();
    for (const part of specParts) {
      const d = part.data;
      if (d.type === "patch") {
        compiler.push(JSON.stringify({ ...d.patch }));
      } else if (d.type === "flat") {
        // Complete flat spec — return directly
        return d.spec;
      }
    }
    return compiler.current() ?? null;
  });
}
