import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "Schemas | json-render",
};

export default function SchemasPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Schemas</h1>
      <p className="text-muted-foreground mb-8">
        Schemas define the structure and validation rules for your UI specs.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">What is a Schema?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A schema defines the JSON structure that describes your UI. It includes:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <strong className="text-foreground">Element structure</strong> — How
          components are nested and referenced
        </li>
        <li>
          <strong className="text-foreground">Property types</strong> — What
          props each component accepts
        </li>
        <li>
          <strong className="text-foreground">Data binding syntax</strong> — How
          to reference dynamic data
        </li>
        <li>
          <strong className="text-foreground">Action format</strong> — How user
          interactions are defined
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Schema-Agnostic by Design
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render can work with any JSON schema.{" "}
        <code className="text-foreground">@json-render/core</code> provides the
        primitives to define catalogs and renderers for any format:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <strong className="text-foreground">@json-render/react</strong> — The
          built-in flat element tree schema
        </li>
        <li>
          <strong className="text-foreground">
            <Link href="/docs/a2ui" className="hover:underline">
              A2UI
            </Link>
          </strong>{" "}
          — Google{"'"}s Agent-to-User Interaction protocol
        </li>
        <li>
          <strong className="text-foreground">
            <Link href="/docs/adaptive-cards" className="hover:underline">
              Adaptive Cards
            </Link>
          </strong>{" "}
          — Microsoft{"'"}s platform-agnostic UI format
        </li>
        <li>
          <strong className="text-foreground">AG-UI</strong> — CopilotKit{"'"}s
          Agent User Interaction Protocol
        </li>
        <li>
          <strong className="text-foreground">OpenAPI/Swagger</strong> — API
          documentation schemas for dynamic forms
        </li>
        <li>
          <strong className="text-foreground">Custom schemas</strong> — Design
          your own format tailored to your domain
        </li>
      </ul>
      <p className="text-sm text-muted-foreground mb-4">
        See the{" "}
        <Link
          href="/docs/custom-schema"
          className="text-foreground hover:underline"
        >
          Custom Schema guide
        </Link>{" "}
        to learn how to implement support for any schema.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Built-in Schema</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <code className="text-foreground">@json-render/react</code> uses a flat
        element tree schema with a root key and elements map:
      </p>
      <Code lang="json">{`{
  "root": "card-1",
  "elements": {
    "card-1": {
      "key": "card-1",
      "type": "Card",
      "props": { "title": "Dashboard" },
      "children": ["text-1", "button-1"],
      "parentKey": ""
    },
    "text-1": {
      "key": "text-1",
      "type": "Text",
      "props": { "content": "Welcome, $data.user.name" },
      "children": [],
      "parentKey": "card-1"
    },
    "button-1": {
      "key": "button-1",
      "type": "Button",
      "props": { "label": "Click me" },
      "children": [],
      "parentKey": "card-1"
    }
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Schema Components</h2>

      <h3 className="text-lg font-medium mt-8 mb-3">Element Structure</h3>
      <p className="text-sm text-muted-foreground mb-4">
        In the built-in schema, each element in the elements map has this
        structure:
      </p>
      <Code lang="typescript">{`interface Element {
  key: string;                 // Unique identifier
  type: string;                // Component type from catalog
  props: Record<string, any>;  // Component properties
  children: string[];          // Array of child element keys
  parentKey: string;           // Parent element key (empty for root)
  visible?: VisibilityRule;    // Conditional display
}`}</Code>

      <h3 className="text-lg font-medium mt-8 mb-3">Data Binding Syntax</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Reference dynamic data using the{" "}
        <code className="text-foreground">$data</code> prefix in props:
      </p>
      <Code lang="json">{`{
  "key": "greeting",
  "type": "Text",
  "props": {
    "content": "$data.user.name",
    "count": "$data.items.length"
  },
  "children": [],
  "parentKey": "card-1"
}`}</Code>

      <h3 className="text-lg font-medium mt-8 mb-3">Action Format</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Actions are defined in the catalog and referenced from components. The
        renderer handles action execution:
      </p>
      <Code lang="typescript">{`// In your catalog
actions: {
  navigate: {
    params: z.object({ url: z.string() }),
    description: 'Navigate to a URL',
  },
  apiCall: {
    params: z.object({
      endpoint: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    }),
    description: 'Make an API request',
  },
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Custom Schemas</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <code className="text-foreground">@json-render/core</code> is
        schema-agnostic. You can define any JSON structure:
      </p>
      <Code lang="typescript">{`import { z } from 'zod';

// Define your own element schema
const MyElementSchema = z.object({
  component: z.string(),
  settings: z.record(z.unknown()),
  nested: z.array(z.lazy(() => MyElementSchema)).optional(),
});

// Define your own data binding format
const BoundValue = z.object({
  literal: z.string().optional(),
  path: z.string().optional(),  // e.g., "/users/0/name"
});

// Define your own action format
const ActionSchema = z.object({
  name: z.string(),
  context: z.record(z.unknown()).optional(),
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Schema vs Catalog</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The schema and catalog work together but serve different purposes:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <strong className="text-foreground">Schema</strong> — Defines the JSON
          structure (how elements are organized)
        </li>
        <li>
          <strong className="text-foreground">Catalog</strong> — Defines
          available components and their props (what can be used)
        </li>
      </ul>
      <p className="text-sm text-muted-foreground mb-4">
        The schema is the grammar; the catalog is the vocabulary.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link href="/docs/specs" className="text-foreground hover:underline">
          specs
        </Link>{" "}
        — the actual JSON documents that describe your UI.
      </p>
    </article>
  );
}
