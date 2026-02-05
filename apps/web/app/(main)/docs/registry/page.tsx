import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "Registry | json-render",
};

export default function RegistryPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Registry</h1>
      <p className="text-muted-foreground mb-8">
        Register React components and action handlers to bring your catalog to
        life.
      </p>

      {/* Components Section */}
      <h2 className="text-xl font-semibold mt-12 mb-4">Component Registry</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a registry that maps catalog component types to React components:
      </p>
      <Code lang="tsx">{`import { useAction } from '@json-render/react';

const registry = {
  Card: ({ props, children }) => (
    <div className="card">
      <h2>{props.title}</h2>
      {props.description && <p>{props.description}</p>}
      {children}
    </div>
  ),
  
  Button: ({ props }) => {
    const executeAction = useAction(props.action);
    return (
      <button onClick={() => executeAction({})}>
        {props.label}
      </button>
    );
  },
};`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Component Props</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Each component receives these props:
      </p>
      <Code lang="typescript">{`interface ComponentProps<T = Record<string, unknown>> {
  props: T;                    // Component props from the spec
  children?: React.ReactNode;  // Rendered children (for slot components)
}

// Type-safe props by extracting from your catalog
type CardProps = ComponentProps<{
  title: string;
  description: string | null;
}>;

// Use hooks for actions and data within components
import { useAction, useDataValue } from '@json-render/react';`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Using Data Binding</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use hooks to read and write data:
      </p>
      <Code lang="tsx">{`import { useDataValue, useDataBinding } from '@json-render/react';

const Metric = ({ props }) => {
  // Read-only value from data context
  const value = useDataValue(props.valuePath);
  
  return (
    <div className="metric">
      <span className="label">{props.label}</span>
      <span className="value">{formatValue(value)}</span>
    </div>
  );
};

const TextField = ({ props }) => {
  // Two-way binding to data context
  const [value, setValue] = useDataBinding(props.valuePath);
  
  return (
    <input
      value={value || ''}
      onChange={(e) => setValue(e.target.value)}
      placeholder={props.placeholder}
    />
  );
};`}</Code>

      {/* Actions Section */}
      <h2 className="text-xl font-semibold mt-12 mb-4">Action Handlers</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Instead of AI generating arbitrary code, it declares <em>intent</em> by
        name. Your application provides the implementation. This is a core
        guardrail.
      </p>

      <h3 className="text-lg font-medium mt-8 mb-3">Defining Actions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Define available actions in your catalog:
      </p>
      <Code lang="typescript">{`import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react';
import { z } from 'zod';

const catalog = defineCatalog(schema, {
  components: { /* ... */ },
  actions: {
    submit_form: {
      params: z.object({
        formId: z.string(),
      }),
      description: 'Submit a form',
    },
    export_data: {
      params: z.object({
        format: z.enum(['csv', 'pdf', 'json']),
        filters: z.object({
          dateRange: z.string().nullable(),
        }).nullable(),
      }),
    },
    navigate: {
      params: z.object({
        url: z.string(),
      }),
    },
  },
});`}</Code>

      <h3 className="text-lg font-medium mt-8 mb-3">ActionProvider</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Provide action handlers to your app:
      </p>
      <Code lang="tsx">{`import { ActionProvider } from '@json-render/react';

function App() {
  const handlers = {
    submit_form: async (params) => {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ formId: params.formId }),
      });
      return response.json();
    },
    
    export_data: async (params) => {
      const blob = await generateExport(params.format, params.filters);
      downloadBlob(blob, \`export.\${params.format}\`);
    },
    
    navigate: (params) => {
      window.location.href = params.url;
    },
  };

  return (
    <ActionProvider handlers={handlers}>
      {/* Your UI */}
    </ActionProvider>
  );
}`}</Code>

      <h3 className="text-lg font-medium mt-8 mb-3">
        Using Actions in Components
      </h3>
      <Code lang="tsx">{`import { useAction } from '@json-render/react';

// Using the useAction hook (recommended)
const Button = ({ props }) => {
  const executeAction = useAction(props.action);
  
  return (
    <button onClick={() => executeAction({})}>
      {props.label}
    </button>
  );
};

// Or for standalone use
function SubmitButton() {
  const submitForm = useAction('submit_form');
  
  return (
    <button onClick={() => submitForm({ formId: 'contact' })}>
      Submit
    </button>
  );
}`}</Code>

      {/* Renderer Section */}
      <h2 className="text-xl font-semibold mt-12 mb-4">Using the Renderer</h2>
      <Code lang="tsx">{`import { Renderer, ActionProvider } from '@json-render/react';

function App() {
  return (
    <ActionProvider handlers={actionHandlers}>
      <Renderer
        spec={uiSpec}
        registry={registry}
      />
    </ActionProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link
          href="/docs/data-binding"
          className="text-foreground hover:underline"
        >
          data binding
        </Link>{" "}
        for dynamic values.
      </p>
    </article>
  );
}
