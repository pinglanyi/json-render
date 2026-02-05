import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "A2UI Integration | json-render",
};

export default function A2UIPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">A2UI Integration</h1>
      <p className="text-muted-foreground mb-8">
        Use <code className="text-foreground">@json-render/core</code> to
        support{" "}
        <a
          href="https://a2ui.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          A2UI
        </a>{" "}
        natively.
      </p>

      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 mb-8">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Concept:</strong> This page demonstrates how json-render can
          support A2UI. The examples are illustrative and may require adaptation
          for production use.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-4">Native A2UI Support</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <code className="text-foreground">@json-render/core</code> is
        schema-agnostic. Define a catalog that matches A2UI&apos;s format and
        build a renderer that understands it - no conversion layer needed.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Example A2UI Message</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A2UI uses an adjacency list model - a flat list of components with ID
        references. This makes it easy to patch individual components:
      </p>
      <Code lang="json">{`{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [
      {
        "id": "header",
        "component": {
          "Text": {
            "text": {"literalString": "Book Your Table"},
            "usageHint": "h1"
          }
        }
      },
      {
        "id": "date-picker",
        "component": {
          "DateTimeInput": {
            "label": {"literalString": "Select Date"},
            "value": {"path": "/reservation/date"},
            "enableDate": true
          }
        }
      },
      {
        "id": "submit-btn",
        "component": {
          "Button": {
            "child": "submit-text",
            "action": {"name": "confirm_booking"}
          }
        }
      },
      {
        "id": "submit-text",
        "component": {
          "Text": {"text": {"literalString": "Confirm Reservation"}}
        }
      }
    ]
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Define the A2UI Catalog
      </h2>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

// A2UI BoundValue schema
const BoundString = z.object({
  literalString: z.string().optional(),
  path: z.string().optional(),
}).refine(d => d.literalString || d.path);

// A2UI children schema
const Children = z.object({
  explicitList: z.array(z.string()).optional(),
  template: z.object({
    dataBinding: z.string(),
    componentId: z.string(),
  }).optional(),
}).refine(d => d.explicitList || d.template);

export const a2uiCatalog = createCatalog({
  components: {
    Text: {
      description: 'Displays text content',
      props: z.object({
        text: BoundString,
        usageHint: z.enum(['h1', 'h2', 'h3', 'body', 'caption']).optional(),
      }),
    },
    Button: {
      description: 'Interactive button',
      props: z.object({
        child: z.string(),
        action: z.object({
          name: z.string(),
          context: z.array(z.object({
            key: z.string(),
            value: BoundString,
          })).optional(),
        }).optional(),
      }),
    },
    DateTimeInput: {
      description: 'Date/time picker',
      props: z.object({
        label: BoundString.optional(),
        value: BoundString.optional(),
        enableDate: z.boolean().optional(),
        enableTime: z.boolean().optional(),
      }),
    },
    Column: {
      description: 'Vertical layout',
      props: z.object({
        children: Children,
      }),
    },
    Row: {
      description: 'Horizontal layout',
      props: z.object({
        children: Children,
      }),
    },
    // Add more A2UI standard components...
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Define the A2UI Schema
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define the schema for A2UI message types:
      </p>
      <Code lang="typescript">{`import { z } from 'zod';

// Component instance in the adjacency list
const A2UIComponent = z.object({
  id: z.string(),
  component: z.record(z.record(z.unknown())),
});

// Surface update message
const SurfaceUpdate = z.object({
  surfaceId: z.string().optional(),
  components: z.array(A2UIComponent),
});

// Data model update message
const DataModelUpdate = z.object({
  surfaceId: z.string().optional(),
  path: z.string().optional(),
  contents: z.array(z.object({
    key: z.string(),
    valueString: z.string().optional(),
    valueNumber: z.number().optional(),
    valueBoolean: z.boolean().optional(),
    valueMap: z.array(z.unknown()).optional(),
  })),
});

// Begin rendering message
const BeginRendering = z.object({
  surfaceId: z.string().optional(),
  root: z.string(),
  catalogId: z.string().optional(),
});

// Complete A2UI message schema
export const A2UIMessage = z.object({
  surfaceUpdate: SurfaceUpdate.optional(),
  dataModelUpdate: DataModelUpdate.optional(),
  beginRendering: BeginRendering.optional(),
  deleteSurface: z.object({ surfaceId: z.string() }).optional(),
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Build an A2UI Renderer
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a renderer that processes the A2UI adjacency list format:
      </p>
      <Code lang="tsx">{`import { a2uiCatalog } from './catalog';

// Component registry
const components = {
  Text: ({ text, usageHint }) => {
    const Tag = usageHint?.startsWith('h') ? usageHint : 'p';
    return <Tag>{text}</Tag>;
  },
  Button: ({ children, action, onAction }) => (
    <button onClick={() => onAction?.(action)}>{children}</button>
  ),
  DateTimeInput: ({ label, value, onChange }) => (
    <label>
      {label}
      <input type="date" value={value} onChange={e => onChange?.(e.target.value)} />
    </label>
  ),
  Column: ({ children }) => <div className="flex flex-col gap-2">{children}</div>,
  Row: ({ children }) => <div className="flex gap-2">{children}</div>,
};

// Render A2UI surface
export function renderA2UI(
  componentMap: Map<string, any>,
  dataModel: Record<string, any>,
  rootId: string,
  onAction?: (action: any) => void
) {
  function resolveBoundValue(bound: any) {
    if (!bound) return undefined;
    if (bound.literalString) return bound.literalString;
    if (bound.path) {
      const parts = bound.path.replace(/^\\//, '').split('/');
      let value = dataModel;
      for (const p of parts) value = value?.[p];
      return value;
    }
  }

  function render(id: string): React.ReactNode {
    const comp = componentMap.get(id);
    if (!comp) return null;

    const [type, props] = Object.entries(comp.component)[0];
    const Component = components[type];
    if (!Component) return null;

    // Resolve props
    const resolved: any = {};
    for (const [key, val] of Object.entries(props as any)) {
      if (key === 'child') {
        resolved.children = render(val as string);
      } else if (key === 'children' && val?.explicitList) {
        resolved.children = val.explicitList.map(render);
      } else if (val && typeof val === 'object' && ('literalString' in val || 'path' in val)) {
        resolved[key] = resolveBoundValue(val);
      } else {
        resolved[key] = val;
      }
    }

    return <Component key={id} {...resolved} onAction={onAction} />;
  }

  return render(rootId);
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Usage</h2>
      <Code lang="tsx">{`const [components] = useState(() => new Map());
const [dataModel, setDataModel] = useState({});
const [rootId, setRootId] = useState<string | null>(null);

// Process A2UI messages
function handleMessage(msg: any) {
  if (msg.surfaceUpdate) {
    for (const comp of msg.surfaceUpdate.components) {
      components.set(comp.id, comp);
    }
  }
  if (msg.dataModelUpdate) {
    setDataModel(prev => ({ ...prev, ...msg.dataModelUpdate.contents }));
  }
  if (msg.beginRendering) {
    setRootId(msg.beginRendering.root);
  }
}

// Render
{rootId && renderA2UI(components, dataModel, rootId, handleAction)}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link
          href="/docs/adaptive-cards"
          className="text-foreground hover:underline"
        >
          Adaptive Cards integration
        </Link>{" "}
        for another UI protocol.
      </p>
    </article>
  );
}
