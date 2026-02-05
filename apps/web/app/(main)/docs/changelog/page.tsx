import { Code } from "@/components/code";

export const metadata = {
  title: "Changelog | json-render",
};

export default function ChangelogPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        Notable changes and updates to json-render.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">v0.3.0</h2>
      <p className="text-sm text-muted-foreground mb-6">February 2026</p>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        New: Custom Schema System
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create custom output formats with <code>defineSchema</code>. Each
        renderer now defines its own schema, enabling completely different spec
        formats for different use cases.
      </p>
      <Code lang="typescript">{`import { defineSchema } from "@json-render/core";

const mySchema = defineSchema((s) => ({
  spec: s.object({
    pages: s.array(s.object({
      title: s.string(),
      blocks: s.array(s.ref("catalog.blocks")),
    })),
  }),
  catalog: s.object({
    blocks: s.map({ props: s.zod(), description: s.string() }),
  }),
}), {
  promptTemplate: myPromptTemplate,
});`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        New: AI Prompt Generation
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Catalogs now generate AI system prompts automatically with{" "}
        <code>catalog.prompt()</code>. The prompt includes all component
        definitions, props schemas, and action descriptions - ensuring the AI
        only generates valid specs.
      </p>
      <Code lang="typescript">{`import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";

const catalog = defineCatalog(schema, {
  components: { /* ... */ },
  actions: { /* ... */ },
});

// Generate system prompt for AI
const systemPrompt = catalog.prompt();

// Use with any AI SDK
const result = await streamText({
  model: "claude-haiku-4.5",
  system: systemPrompt,
  prompt: userMessage,
});`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">New: SpecStream</h3>
      <p className="text-sm text-muted-foreground mb-4">
        SpecStream is json-render&apos;s streaming format for progressively
        building specs from JSONL patches. The new compiler API makes it easy to
        process streaming AI responses.
      </p>
      <Code lang="typescript">{`import { createSpecStreamCompiler } from "@json-render/core";

const compiler = createSpecStreamCompiler<MySpec>();

// Process streaming chunks
const { result, newPatches } = compiler.push(chunk);
setSpec(result); // Update UI with partial result`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        New: @json-render/codegen
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Export specs as React code. Traverse specs and serialize them to JSX for
        code export features.
      </p>
      <Code lang="typescript">{`import { traverseSpec, serializeToJSX } from "@json-render/codegen";

const jsx = serializeToJSX(spec, catalog);
// Returns: <Card title="Hello"><Button label="Click" /></Card>`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        New: @json-render/remotion
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate AI-powered videos with Remotion. Define video catalogs, stream
        timeline specs, and render with the Remotion Player.
      </p>
      <Code lang="tsx">{`import { Player } from "@remotion/player";
import { Renderer, schema, standardComponentDefinitions } from "@json-render/remotion";

const catalog = defineCatalog(schema, {
  components: standardComponentDefinitions,
  transitions: standardTransitionDefinitions,
});

<Player
  component={Renderer}
  inputProps={{ spec }}
  durationInFrames={spec.composition.durationInFrames}
  fps={spec.composition.fps}
  compositionWidth={spec.composition.width}
  compositionHeight={spec.composition.height}
/>`}</Code>
      <p className="text-sm text-muted-foreground mt-4 mb-4">
        Includes 10 standard video components (TitleCard, TypingText,
        SplitScreen, etc.), 7 transition types, and the ClipWrapper utility for
        custom components.
      </p>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        Improved: Dashboard Example
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        The dashboard example is now a full-featured accounting dashboard with:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>Persistent SQLite database with Drizzle ORM</li>
        <li>RESTful API for customers, invoices, expenses, accounts</li>
        <li>Draggable widget reordering</li>
        <li>AI-powered widget generation with streaming</li>
        <li>Real data binding to database records</li>
      </ul>

      <h3 className="text-lg font-semibold mt-8 mb-4">
        Improved: Documentation
      </h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>Interactive playground for testing specs</li>
        <li>New guides: Custom Schema, Streaming, Code Export</li>
        <li>Full API reference for all packages</li>
        <li>Integration guides: A2UI, AG-UI, Adaptive Cards, OpenAPI</li>
      </ul>

      <h3 className="text-lg font-semibold mt-8 mb-4">Breaking Changes</h3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <code>UITree</code> type renamed to <code>Spec</code>
        </li>
        <li>
          Schema is now imported from renderer packages (
          <code>@json-render/react</code>) not core
        </li>
        <li>
          <code>defineCatalog</code> now requires a schema as first argument
        </li>
      </ul>

      <hr className="my-12 border-border" />

      <h2 className="text-xl font-semibold mt-12 mb-4">v0.2.0</h2>
      <p className="text-sm text-muted-foreground mb-6">January 2026</p>
      <p className="text-sm text-muted-foreground mb-4">
        Initial public release.
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>Core catalog and spec types</li>
        <li>React renderer with contexts for data, actions, visibility</li>
        <li>AI prompt generation from catalogs</li>
        <li>Basic streaming support</li>
        <li>Dashboard example application</li>
      </ul>
    </article>
  );
}
