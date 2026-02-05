# @json-render/react

React renderer for json-render. Turn JSON specs into React components with data binding, visibility, and actions.

## Installation

```bash
npm install @json-render/react @json-render/core zod
```

## Quick Start

### 1. Create a Catalog

```typescript
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      description: "A card container",
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: z.string(),
      }),
      description: "A clickable button",
    },
    Input: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
      }),
      description: "Text input field",
    },
  },
  actions: {
    submit: { description: "Submit the form" },
    cancel: { description: "Cancel and close" },
  },
});
```

### 2. Define Component Implementations

```tsx
import { defineComponents, useData } from "@json-render/react";

export const components = defineComponents(catalog, {
  Card: ({ props, children }) => (
    <div className="card">
      <h3>{props.title}</h3>
      {props.description && <p>{props.description}</p>}
      {children}
    </div>
  ),
  Button: ({ props, onAction }) => (
    <button onClick={() => onAction?.(props.action)}>
      {props.label}
    </button>
  ),
  Input: ({ props }) => {
    const { get, set } = useData();
    return (
      <label>
        {props.label}
        <input
          placeholder={props.placeholder ?? ""}
          value={get("/form/value") ?? ""}
          onChange={(e) => set("/form/value", e.target.value)}
        />
      </label>
    );
  },
});
```

### 3. Render Specs

```tsx
import { Renderer, DataProvider, ActionProvider } from "@json-render/react";

function App({ spec }) {
  const handleAction = (action: string) => {
    console.log("Action triggered:", action);
  };

  return (
    <DataProvider initialData={{ form: { value: "" } }}>
      <ActionProvider onAction={handleAction}>
        <Renderer
          spec={spec}
          catalog={catalog}
          components={components}
        />
      </ActionProvider>
    </DataProvider>
  );
}
```

## Spec Format

The React renderer uses an element tree format:

```typescript
interface Spec {
  root: Element;
}

interface Element {
  type: string;           // Component name from catalog
  props: object;          // Component props
  children?: Element[];   // Nested elements
  visible?: VisibilityCondition;
}
```

Example spec:

```json
{
  "root": {
    "type": "Card",
    "props": { "title": "Welcome" },
    "children": [
      {
        "type": "Input",
        "props": { "label": "Name", "placeholder": "Enter name" }
      },
      {
        "type": "Button",
        "props": { "label": "Submit", "action": "submit" }
      }
    ]
  }
}
```

## Contexts

### DataProvider

Share data across components with JSON Pointer paths:

```tsx
<DataProvider initialData={{ user: { name: "John" } }}>
  {children}
</DataProvider>

// In components:
const { data, get, set } = useData();
const name = get("/user/name");  // "John"
set("/user/age", 25);
```

### ActionProvider

Handle actions from components:

```tsx
<ActionProvider
  onAction={(action) => {
    if (action === "submit") handleSubmit();
    if (action === "cancel") handleCancel();
  }}
>
  {children}
</ActionProvider>
```

### VisibilityProvider

Control element visibility based on data:

```tsx
<VisibilityProvider>
  {children}
</VisibilityProvider>

// Elements can use visibility conditions:
{
  "type": "Alert",
  "props": { "message": "Error!" },
  "visible": { "path": "/form/hasError" }
}
```

### ValidationProvider

Add field validation:

```tsx
<ValidationProvider>
  {children}
</ValidationProvider>

// Use validation hooks:
const { errors, validate } = useFieldValidation("/form/email", {
  checks: [
    { fn: "required", message: "Email required" },
    { fn: "email", message: "Invalid email" },
  ],
});
```

## Hooks

| Hook | Purpose |
|------|---------|
| `useData()` | Access data context (`data`, `get`, `set`) |
| `useDataValue(path)` | Get single value from data |
| `useVisibility()` | Access visibility evaluation |
| `useIsVisible(condition)` | Check if condition is met |
| `useActions()` | Access action context |
| `useFieldValidation(path, config)` | Field validation state |

## Visibility Conditions

```typescript
// Simple path check (truthy)
{ "path": "/user/isAdmin" }

// Auth state
{ "auth": "signedIn" }

// Comparisons
{ "eq": [{ "path": "/status" }, "active"] }
{ "gt": [{ "path": "/count" }, 10] }

// Logical operators
{
  "and": [
    { "path": "/feature/enabled" },
    { "not": { "path": "/maintenance" } }
  ]
}

{
  "or": [
    { "path": "/user/isAdmin" },
    { "path": "/user/isModerator" }
  ]
}
```

## Component Props

Components receive these props:

```typescript
interface ComponentProps<P> {
  props: P;                    // Props from spec
  children?: React.ReactNode;  // Rendered children
  onAction?: (action: string) => void;
}
```

## Generate AI Prompts

```typescript
const systemPrompt = catalog.prompt();
// Returns detailed prompt with component/action descriptions
```

## Full Example

```tsx
import { defineCatalog } from "@json-render/core";
import {
  schema,
  defineComponents,
  Renderer,
  DataProvider,
  ActionProvider,
} from "@json-render/react";
import { z } from "zod";

const catalog = defineCatalog(schema, {
  components: {
    Greeting: {
      props: z.object({ name: z.string() }),
      description: "Displays a greeting",
    },
  },
  actions: {},
});

const components = defineComponents(catalog, {
  Greeting: ({ props }) => <h1>Hello, {props.name}!</h1>,
});

const spec = {
  root: {
    type: "Greeting",
    props: { name: "World" },
  },
};

function App() {
  return (
    <DataProvider initialData={{}}>
      <ActionProvider onAction={() => {}}>
        <Renderer spec={spec} catalog={catalog} components={components} />
      </ActionProvider>
    </DataProvider>
  );
}
```
