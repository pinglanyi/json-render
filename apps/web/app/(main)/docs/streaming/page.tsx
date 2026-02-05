import { Code } from "@/components/code";

export const metadata = {
  title: "Streaming | json-render",
};

export default function StreamingPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Streaming</h1>
      <p className="text-muted-foreground mb-8">
        Progressively render UI as AI generates it.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">SpecStream Format</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render uses <strong>SpecStream</strong>, a JSONL-based streaming
        format where each line is a JSON patch operation that progressively
        builds your spec:
      </p>
      <Code lang="json">{`{"op":"set","path":"/root","value":{"key":"root","type":"Card","props":{"title":"Dashboard"}}}
{"op":"set","path":"/root/children/0","value":{"key":"metric-1","type":"Metric","props":{"label":"Revenue"}}}
{"op":"set","path":"/root/children/1","value":{"key":"metric-2","type":"Metric","props":{"label":"Users"}}}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">useUIStream Hook</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The hook handles parsing and state management:
      </p>
      <Code lang="tsx">{`import { useUIStream } from '@json-render/react';

function App() {
  const {
    spec,          // Current UI spec state
    isStreaming,   // True while streaming
    error,         // Any error that occurred
    send,          // Function to start generation
    abort,         // Function to cancel streaming
  } = useUIStream({
    api: '/api/generate',
    onChunk: (chunk) => {},   // Optional: called for each chunk
    onFinish: (spec) => {},   // Optional: called when complete
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Patch Operations</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Supported operations:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 mb-4">
        <li>
          <code className="text-foreground">set</code> — Set the value at a path
          (creates if needed)
        </li>
        <li>
          <code className="text-foreground">add</code> — Add to an array at a
          path
        </li>
        <li>
          <code className="text-foreground">replace</code> — Replace value at a
          path
        </li>
        <li>
          <code className="text-foreground">remove</code> — Remove value at a
          path
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">Path Format</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Paths use a key-based format for elements:
      </p>
      <Code lang="bash">{`/root              -> Root element
/root/children     -> Children of root
/elements/card-1   -> Element with key "card-1"
/elements/card-1/children -> Children of card-1`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Server-Side Setup</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Ensure your API route streams properly:
      </p>
      <Code lang="typescript">{`import { streamText } from 'ai';
import { catalog } from '@/lib/catalog';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: catalog.prompt(),
    prompt,
  });

  // Return as a streaming response
  return result.toTextStreamResponse();
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Progressive Rendering
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        The Renderer automatically updates as the spec changes:
      </p>
      <Code lang="tsx">{`function App() {
  const { spec, isStreaming } = useUIStream({ api: '/api/generate' });

  return (
    <div>
      {isStreaming && <LoadingIndicator />}
      <Renderer spec={spec} registry={registry} loading={isStreaming} />
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Aborting Streams</h2>
      <Code lang="tsx">{`function App() {
  const { isStreaming, send, abort } = useUIStream({
    api: '/api/generate',
  });

  return (
    <div>
      <button onClick={() => send('Create dashboard')}>
        Generate
      </button>
      {isStreaming && (
        <button onClick={abort}>Cancel</button>
      )}
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Low-Level SpecStream API
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        For custom streaming implementations, use the SpecStream compiler
        directly:
      </p>
      <Code lang="typescript">{`import { createSpecStreamCompiler } from '@json-render/core';

// Create a compiler for your spec type
const compiler = createSpecStreamCompiler<MySpec>();

// Process streaming chunks from AI
async function processStream(reader: ReadableStreamDefaultReader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const { result, newPatches } = compiler.push(value);
    
    if (newPatches.length > 0) {
      // Update UI with partial result
      setSpec(result);
    }
  }
  
  // Get final compiled result
  return compiler.getResult();
}`}</Code>

      <h3 className="text-lg font-semibold mt-8 mb-4">One-Shot Compilation</h3>
      <p className="text-sm text-muted-foreground mb-4">
        For non-streaming scenarios, compile entire SpecStream at once:
      </p>
      <Code lang="typescript">{`import { compileSpecStream } from '@json-render/core';

const jsonl = \`{"op":"set","path":"/root","value":{"type":"Card"}}
{"op":"set","path":"/root/props","value":{"title":"Hello"}}\`;

const spec = compileSpecStream<MySpec>(jsonl);
// { root: { type: "Card", props: { title: "Hello" } } }`}</Code>
    </article>
  );
}
