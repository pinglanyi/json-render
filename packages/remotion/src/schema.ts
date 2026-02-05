import { defineSchema, type PromptContext } from "@json-render/core";

/**
 * Prompt template for Remotion timeline generation
 *
 * Uses JSONL patch format (same as React) but builds up a timeline spec structure.
 */
function remotionPromptTemplate(context: PromptContext): string {
  const { catalog, options } = context;
  const { system = "You are a video timeline generator.", customRules = [] } =
    options;

  const lines: string[] = [];
  lines.push(system);
  lines.push("");

  // Output format - JSONL patches
  lines.push("OUTPUT FORMAT:");
  lines.push(
    "Output JSONL (one JSON object per line) with patches to build a timeline spec.",
  );
  lines.push(
    "Each line is a JSON patch operation. Build the timeline incrementally.",
  );
  lines.push("");
  lines.push("Example output (each line is a separate JSON object):");
  lines.push("");
  lines.push(`{"op":"set","path":"/composition","value":{"id":"intro","fps":30,"width":1920,"height":1080,"durationInFrames":300}}
{"op":"set","path":"/tracks","value":[{"id":"main","name":"Main","type":"video","enabled":true},{"id":"overlay","name":"Overlay","type":"overlay","enabled":true}]}
{"op":"set","path":"/clips/0","value":{"id":"clip-1","trackId":"main","component":"TitleCard","props":{"title":"Welcome","subtitle":"Getting Started"},"from":0,"durationInFrames":90,"transitionIn":{"type":"fade","durationInFrames":15},"transitionOut":{"type":"fade","durationInFrames":15}}}
{"op":"set","path":"/clips/1","value":{"id":"clip-2","trackId":"main","component":"TitleCard","props":{"title":"Features"},"from":90,"durationInFrames":90}}
{"op":"set","path":"/audio","value":{"tracks":[]}}`);
  lines.push("");

  // Components
  const catalogData = catalog as {
    components?: Record<
      string,
      { description?: string; defaultDuration?: number }
    >;
    transitions?: Record<string, { description?: string }>;
    effects?: Record<string, { description?: string }>;
  };

  if (catalogData.components) {
    lines.push(
      `AVAILABLE COMPONENTS (${Object.keys(catalogData.components).length}):`,
    );
    lines.push("");
    for (const [name, def] of Object.entries(catalogData.components)) {
      const duration = def.defaultDuration
        ? ` [default: ${def.defaultDuration} frames]`
        : "";
      lines.push(
        `- ${name}: ${def.description || "No description"}${duration}`,
      );
    }
    lines.push("");
  }

  // Transitions
  if (
    catalogData.transitions &&
    Object.keys(catalogData.transitions).length > 0
  ) {
    lines.push("AVAILABLE TRANSITIONS:");
    lines.push("");
    for (const [name, def] of Object.entries(catalogData.transitions)) {
      lines.push(`- ${name}: ${def.description || "No description"}`);
    }
    lines.push("");
  }

  // Rules
  lines.push("RULES:");
  const baseRules = [
    "Output ONLY JSONL patches - one JSON object per line, no markdown, no code fences",
    "First set /composition with {id, fps:30, width:1920, height:1080, durationInFrames}",
    "Then set /tracks array with video/overlay tracks",
    "Then set each clip: /clips/0, /clips/1, etc.",
    "Finally set /audio with {tracks:[]}",
    "ONLY use components listed above",
    "fps is always 30 (1 second = 30 frames, 10 seconds = 300 frames)",
    'Clips on "main" track flow sequentially (from = previous clip\'s from + durationInFrames)',
    'Overlay clips (LowerThird, TextOverlay) go on "overlay" track',
  ];
  const allRules = [...baseRules, ...customRules];
  allRules.forEach((rule, i) => {
    lines.push(`${i + 1}. ${rule}`);
  });

  return lines.join("\n");
}

/**
 * The schema for @json-render/remotion
 *
 * This schema is fundamentally different from the React element tree schema.
 * It's timeline-based, designed for video composition:
 *
 * - Spec: A composition with tracks containing timed clips
 * - Catalog: Video components (scenes, overlays, etc.) and effects
 *
 * This demonstrates that json-render is truly agnostic - different renderers
 * can have completely different spec formats.
 */
export const schema = defineSchema(
  (s) => ({
    // What the AI-generated SPEC looks like (timeline-based)
    spec: s.object({
      /** Composition settings */
      composition: s.object({
        /** Unique composition ID */
        id: s.string(),
        /** Frames per second */
        fps: s.number(),
        /** Width in pixels */
        width: s.number(),
        /** Height in pixels */
        height: s.number(),
        /** Total duration in frames */
        durationInFrames: s.number(),
      }),

      /** Timeline tracks (like layers in video editing) */
      tracks: s.array(
        s.object({
          /** Unique track ID */
          id: s.string(),
          /** Track name for organization */
          name: s.string(),
          /** Track type: "video" | "audio" | "overlay" | "text" */
          type: s.string(),
          /** Whether track is muted/hidden */
          enabled: s.boolean(),
        }),
      ),

      /** Clips placed on the timeline */
      clips: s.array(
        s.object({
          /** Unique clip ID */
          id: s.string(),
          /** Which track this clip belongs to */
          trackId: s.string(),
          /** Component type from catalog */
          component: s.ref("catalog.components"),
          /** Component props */
          props: s.propsOf("catalog.components"),
          /** Start frame (when clip begins) */
          from: s.number(),
          /** Duration in frames */
          durationInFrames: s.number(),
          /** Transition in effect */
          transitionIn: s.object({
            type: s.ref("catalog.transitions"),
            durationInFrames: s.number(),
          }),
          /** Transition out effect */
          transitionOut: s.object({
            type: s.ref("catalog.transitions"),
            durationInFrames: s.number(),
          }),
        }),
      ),

      /** Audio configuration */
      audio: s.object({
        /** Background music/audio clips */
        tracks: s.array(
          s.object({
            id: s.string(),
            src: s.string(),
            from: s.number(),
            durationInFrames: s.number(),
            volume: s.number(),
          }),
        ),
      }),
    }),

    // What the CATALOG must provide
    catalog: s.object({
      /** Video component definitions (scenes, overlays, etc.) */
      components: s.map({
        /** Zod schema for component props */
        props: s.zod(),
        /** Component type: "scene" | "overlay" | "text" | "image" | "video" */
        type: s.string(),
        /** Default duration in frames (can be overridden per clip) */
        defaultDuration: s.number(),
        /** Description for AI generation hints */
        description: s.string(),
      }),
      /** Transition effect definitions */
      transitions: s.map({
        /** Default duration in frames */
        defaultDuration: s.number(),
        /** Description for AI generation hints */
        description: s.string(),
      }),
      /** Effect definitions (filters, animations, etc.) */
      effects: s.map({
        /** Zod schema for effect params */
        params: s.zod(),
        /** Description for AI generation hints */
        description: s.string(),
      }),
    }),
  }),
  {
    promptTemplate: remotionPromptTemplate,
  },
);

/**
 * Type for the Remotion schema
 */
export type RemotionSchema = typeof schema;

/**
 * Infer the spec type from a catalog
 */
export type RemotionSpec<TCatalog> = typeof schema extends {
  createCatalog: (catalog: TCatalog) => { _specType: infer S };
}
  ? S
  : never;
