import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "Quick Start | json-render",
};

export default function QuickStartPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Quick Start</h1>
      <p className="text-muted-foreground mb-8">
        Get up and running with json-render in 5 minutes.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        1. Define your catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a catalog that defines what components AI can use:
      </p>
      <Code lang="typescript">{`// lib/catalog.ts
import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react';
import { z } from 'zod';

export const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description: "Container card with optional title",
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: z.string().nullable(),
      }),
      description: "Clickable button that triggers an action",
    },
    Text: {
      props: z.object({
        content: z.string(),
      }),
      description: "Text paragraph",
    },
  },
  actions: {
    submit: {
      params: z.object({ formId: z.string() }),
      description: "Submit a form",
    },
    navigate: {
      params: z.object({ url: z.string() }),
      description: "Navigate to a URL",
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        2. Create your components and actions
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define React components that render each catalog type. Each component
        receives <code className="text-foreground">props</code>,{" "}
        <code className="text-foreground">children</code>, and{" "}
        <code className="text-foreground">onAction</code>:
      </p>
      <Code lang="tsx">{`// lib/components.tsx
import { defineComponents } from '@json-render/react';
import { catalog } from './catalog';

export const components = defineComponents(catalog, {
  Card: ({ props, children }) => (
    <div className="p-4 border rounded-lg">
      <h2 className="font-bold">{props.title}</h2>
      {props.description && (
        <p className="text-gray-600">{props.description}</p>
      )}
      {children}
    </div>
  ),
  Button: ({ props, onAction }) => (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => onAction?.(props.action)}
    >
      {props.label}
    </button>
  ),
  Text: ({ props }) => (
    <p>{props.content}</p>
  ),
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        3. Create an API route
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Set up a streaming API route for AI generation:
      </p>
      <Code lang="typescript">{`// app/api/generate/route.ts
import { streamText } from 'ai';
import { catalog } from '@/lib/catalog';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Generate system prompt from catalog
  const systemPrompt = catalog.prompt();

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: systemPrompt,
    prompt,
  });

  return result.toTextStreamResponse();
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">4. Render the UI</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use the providers and renderer to display AI-generated UI:
      </p>
      <Code lang="tsx">{`// app/page.tsx
'use client';

import { DataProvider, ActionProvider, VisibilityProvider, Renderer, useUIStream } from '@json-render/react';
import { catalog } from '@/lib/catalog';
import { components } from '@/lib/components';

export default function Page() {
  const { spec, isStreaming, send } = useUIStream({
    api: '/api/generate',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    send(formData.get('prompt') as string);
  };

  return (
    <DataProvider initialData={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{
          submit: (params) => console.log('Submit:', params),
          navigate: (params) => console.log('Navigate:', params),
        }}>
          <form onSubmit={handleSubmit}>
            <input
              name="prompt"
              placeholder="Describe what you want..."
              className="border p-2 rounded"
            />
            <button type="submit" disabled={isStreaming}>
              Generate
            </button>
          </form>

          <div className="mt-8">
            <Renderer spec={spec} catalog={catalog} components={components} loading={isStreaming} />
          </div>
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next steps</h2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
        <li>
          Learn about{" "}
          <Link
            href="/docs/catalog"
            className="text-foreground hover:underline"
          >
            catalogs
          </Link>{" "}
          in depth
        </li>
        <li>
          Explore{" "}
          <Link
            href="/docs/data-binding"
            className="text-foreground hover:underline"
          >
            data binding
          </Link>{" "}
          for dynamic values
        </li>
        <li>
          Add{" "}
          <Link
            href="/docs/actions"
            className="text-foreground hover:underline"
          >
            actions
          </Link>{" "}
          for interactivity
        </li>
        <li>
          Implement{" "}
          <Link
            href="/docs/visibility"
            className="text-foreground hover:underline"
          >
            conditional visibility
          </Link>
        </li>
      </ul>
    </article>
  );
}
