import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "OpenAPI Integration | json-render",
};

export default function OpenAPIPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">OpenAPI Integration</h1>
      <p className="text-muted-foreground mb-8">
        Use json-render to generate dynamic forms and UIs from{" "}
        <a
          href="https://swagger.io/specification/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          OpenAPI/Swagger
        </a>{" "}
        schemas.
      </p>

      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 mb-8">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Concept:</strong> This page demonstrates how json-render can
          support OpenAPI schemas. The examples are illustrative and may require
          adaptation for production use.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-4">Why OpenAPI?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        OpenAPI specifications describe your API{"'"}s endpoints, request
        bodies, and response schemas. By converting OpenAPI schemas to
        json-render specs, you can:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>Automatically generate forms for API endpoints</li>
        <li>Display API responses with type-aware rendering</li>
        <li>Keep your UI in sync with your API schema</li>
        <li>Let AI generate UIs that match your API contracts</li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Example OpenAPI Schema
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        A typical OpenAPI schema for a request body:
      </p>
      <Code lang="json">{`{
  "openapi": "3.0.0",
  "paths": {
    "/users": {
      "post": {
        "summary": "Create a new user",
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateUserRequest"
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreateUserRequest": {
        "type": "object",
        "required": ["email", "name"],
        "properties": {
          "name": {
            "type": "string",
            "description": "User's full name",
            "minLength": 1,
            "maxLength": 100
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "User's email address"
          },
          "age": {
            "type": "integer",
            "minimum": 0,
            "maximum": 150,
            "description": "User's age"
          },
          "role": {
            "type": "string",
            "enum": ["admin", "user", "guest"],
            "default": "user",
            "description": "User's role"
          },
          "preferences": {
            "type": "object",
            "properties": {
              "newsletter": {
                "type": "boolean",
                "default": false
              },
              "theme": {
                "type": "string",
                "enum": ["light", "dark", "system"]
              }
            }
          }
        }
      }
    }
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Define an OpenAPI-to-UI Catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create components that map to OpenAPI data types:
      </p>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const openapiCatalog = createCatalog({
  components: {
    // Form container
    Form: {
      description: 'API form container',
      props: z.object({
        operationId: z.string(),
        endpoint: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    },

    // Field components mapped to OpenAPI types
    StringField: {
      description: 'String input field',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        format: z.enum(['text', 'email', 'uri', 'uuid', 'date', 'date-time', 'password']).optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
        placeholder: z.string().optional(),
        defaultValue: z.string().optional(),
      }),
    },

    NumberField: {
      description: 'Number input field',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        type: z.enum(['integer', 'number']).optional(),
        minimum: z.number().optional(),
        maximum: z.number().optional(),
        exclusiveMinimum: z.number().optional(),
        exclusiveMaximum: z.number().optional(),
        multipleOf: z.number().optional(),
        defaultValue: z.number().optional(),
      }),
    },

    BooleanField: {
      description: 'Boolean toggle field',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        defaultValue: z.boolean().optional(),
      }),
    },

    EnumField: {
      description: 'Enum selection field',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        options: z.array(z.object({
          value: z.string(),
          label: z.string().optional(),
        })),
        defaultValue: z.string().optional(),
      }),
    },

    ArrayField: {
      description: 'Array of items',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        minItems: z.number().optional(),
        maxItems: z.number().optional(),
        uniqueItems: z.boolean().optional(),
      }),
    },

    ObjectField: {
      description: 'Nested object group',
      props: z.object({
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        collapsible: z.boolean().optional(),
      }),
    },

    // Response display components
    ResponseDisplay: {
      description: 'Displays API response',
      props: z.object({
        status: z.number(),
        statusText: z.string().optional(),
      }),
    },

    SchemaTable: {
      description: 'Displays data matching a schema',
      props: z.object({
        schema: z.string(),
        data: z.array(z.record(z.unknown())),
      }),
    },
  },

  actions: {
    submit: {
      description: 'Submit form to API endpoint',
      params: z.object({
        operationId: z.string(),
      }),
    },
    reset: {
      description: 'Reset form to defaults',
      params: z.object({}),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Convert OpenAPI Schema to Spec
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Transform OpenAPI schemas into json-render specs:
      </p>
      <Code lang="typescript">{`interface OpenAPISchema {
  type?: string;
  format?: string;
  enum?: string[];
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  required?: string[];
  description?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  default?: unknown;
}

interface SpecElement {
  key: string;
  type: string;
  props: Record<string, unknown>;
  children: string[];
  parentKey: string;
}

function schemaToSpec(
  schema: OpenAPISchema,
  name: string,
  required: string[] = [],
  parentKey: string = '',
  elements: Map<string, SpecElement> = new Map(),
): string {
  const key = parentKey ? \`\${parentKey}-\${name}\` : name;
  const isRequired = required.includes(name);
  const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');

  if (schema.enum) {
    elements.set(key, {
      key,
      type: 'EnumField',
      props: {
        name,
        label,
        description: schema.description,
        required: isRequired,
        options: schema.enum.map(v => ({ value: v, label: v })),
        defaultValue: schema.default as string,
      },
      children: [],
      parentKey,
    });
  } else if (schema.type === 'string') {
    elements.set(key, {
      key,
      type: 'StringField',
      props: {
        name,
        label,
        description: schema.description,
        required: isRequired,
        format: schema.format || 'text',
        minLength: schema.minLength,
        maxLength: schema.maxLength,
        defaultValue: schema.default as string,
      },
      children: [],
      parentKey,
    });
  } else if (schema.type === 'integer' || schema.type === 'number') {
    elements.set(key, {
      key,
      type: 'NumberField',
      props: {
        name,
        label,
        description: schema.description,
        required: isRequired,
        type: schema.type,
        minimum: schema.minimum,
        maximum: schema.maximum,
        defaultValue: schema.default as number,
      },
      children: [],
      parentKey,
    });
  } else if (schema.type === 'boolean') {
    elements.set(key, {
      key,
      type: 'BooleanField',
      props: {
        name,
        label,
        description: schema.description,
        defaultValue: schema.default as boolean,
      },
      children: [],
      parentKey,
    });
  } else if (schema.type === 'array' && schema.items) {
    const childKeys: string[] = [];
    const itemKey = schemaToSpec(schema.items, 'item', [], key, elements);
    childKeys.push(itemKey);

    elements.set(key, {
      key,
      type: 'ArrayField',
      props: {
        name,
        label,
        description: schema.description,
      },
      children: childKeys,
      parentKey,
    });
  } else if (schema.type === 'object' && schema.properties) {
    const childKeys: string[] = [];

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const childKey = schemaToSpec(
        propSchema,
        propName,
        schema.required || [],
        key,
        elements,
      );
      childKeys.push(childKey);
    }

    elements.set(key, {
      key,
      type: 'ObjectField',
      props: {
        name,
        label,
        description: schema.description,
      },
      children: childKeys,
      parentKey,
    });
  }

  return key;
}

// Convert full OpenAPI operation to spec
export function operationToSpec(
  operationId: string,
  method: string,
  path: string,
  schema: OpenAPISchema,
  title?: string,
  description?: string,
) {
  const elements = new Map<string, SpecElement>();
  const rootKey = 'form';
  const childKeys: string[] = [];

  if (schema.properties) {
    for (const [name, propSchema] of Object.entries(schema.properties)) {
      const childKey = schemaToSpec(
        propSchema,
        name,
        schema.required || [],
        rootKey,
        elements,
      );
      childKeys.push(childKey);
    }
  }

  elements.set(rootKey, {
    key: rootKey,
    type: 'Form',
    props: {
      operationId,
      endpoint: path,
      method: method.toUpperCase(),
      title,
      description,
    },
    children: childKeys,
    parentKey: '',
  });

  return {
    root: rootKey,
    elements: Object.fromEntries(elements),
  };
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Build an OpenAPI Form Renderer
      </h2>
      <Code lang="tsx">{`'use client';

import React, { useState } from 'react';

interface FieldProps {
  name: string;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

const fields: Record<string, React.FC<any>> = {
  StringField: ({ name, label, description, required, format, value, onChange }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <input
        type={format === 'email' ? 'email' : format === 'password' ? 'password' : 'text'}
        className="w-full px-3 py-2 border rounded text-sm"
        value={(value as string) || ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
      />
    </div>
  ),

  NumberField: ({ name, label, description, required, minimum, maximum, value, onChange }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <input
        type="number"
        className="w-full px-3 py-2 border rounded text-sm"
        value={(value as number) ?? ''}
        min={minimum}
        max={maximum}
        onChange={(e) => onChange(name, e.target.value ? parseFloat(e.target.value) : undefined)}
        required={required}
      />
    </div>
  ),

  BooleanField: ({ name, label, description, value, onChange }) => (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id={name}
        checked={Boolean(value)}
        onChange={(e) => onChange(name, e.target.checked)}
        className="mt-1"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium">{label}</label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  ),

  EnumField: ({ name, label, description, required, options, value, onChange }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <select
        className="w-full px-3 py-2 border rounded text-sm"
        value={(value as string) || ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
      >
        <option value="">Select...</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label || opt.value}
          </option>
        ))}
      </select>
    </div>
  ),

  ObjectField: ({ name, label, description, children }) => (
    <fieldset className="border rounded p-4 space-y-4">
      <legend className="text-sm font-medium px-2">{label}</legend>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  ),

  Form: ({ title, description, endpoint, method, children, onSubmit }) => (
    <form
      className="space-y-4 max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
      >
        {method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : 'Submit'}
      </button>
    </form>
  ),
};

interface OpenAPIFormProps {
  spec: {
    root: string;
    elements: Record<string, any>;
  };
  onSubmit: (data: Record<string, unknown>) => void;
}

export function OpenAPIForm({ spec, onSubmit }: OpenAPIFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  function renderElement(key: string): React.ReactNode {
    const element = spec.elements[key];
    if (!element) return null;

    const Field = fields[element.type];
    if (!Field) return null;

    const children = element.children?.map(renderElement);

    return (
      <Field
        key={key}
        {...element.props}
        value={formData[element.props.name]}
        onChange={handleChange}
        onSubmit={() => onSubmit(formData)}
      >
        {children}
      </Field>
    );
  }

  return <>{renderElement(spec.root)}</>;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Usage Example</h2>
      <Code lang="tsx">{`'use client';

import { OpenAPIForm } from './openapi-form';
import { operationToSpec } from './openapi-to-spec';

// Your OpenAPI schema (typically loaded from your API)
const createUserSchema = {
  type: 'object',
  required: ['email', 'name'],
  properties: {
    name: { type: 'string', description: "User's full name" },
    email: { type: 'string', format: 'email', description: "User's email" },
    age: { type: 'integer', minimum: 0, maximum: 150 },
    role: { type: 'string', enum: ['admin', 'user', 'guest'], default: 'user' },
  },
};

// Convert to spec
const spec = operationToSpec(
  'createUser',
  'POST',
  '/api/users',
  createUserSchema,
  'Create User',
  'Add a new user to the system',
);

export function CreateUserForm() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('User created!');
    }
  };

  return <OpenAPIForm spec={spec} onSubmit={handleSubmit} />;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Auto-generating from OpenAPI Document
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Load and parse an OpenAPI document to generate forms for all operations:
      </p>
      <Code lang="typescript">{`import SwaggerParser from '@apidevtools/swagger-parser';
import { operationToSpec } from './openapi-to-spec';

interface OpenAPIDocument {
  paths: Record<string, Record<string, {
    operationId?: string;
    summary?: string;
    description?: string;
    requestBody?: {
      content?: {
        'application/json'?: {
          schema?: any;
        };
      };
    };
  }>>;
  components?: {
    schemas?: Record<string, any>;
  };
}

export async function loadOpenAPISpecs(specUrl: string) {
  const api = await SwaggerParser.dereference(specUrl) as OpenAPIDocument;
  const specs: Record<string, any> = {};

  for (const [path, methods] of Object.entries(api.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation.requestBody?.content?.['application/json']?.schema) continue;

      const schema = operation.requestBody.content['application/json'].schema;
      const operationId = operation.operationId || \`\${method}_\${path.replace(/\\//g, '_')}\`;

      specs[operationId] = operationToSpec(
        operationId,
        method,
        path,
        schema,
        operation.summary,
        operation.description,
      );
    }
  }

  return specs;
}

// Usage
const specs = await loadOpenAPISpecs('https://api.example.com/openapi.json');
// specs.createUser, specs.updateUser, etc.`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link
          href="/docs/streaming"
          className="text-foreground hover:underline"
        >
          streaming
        </Link>{" "}
        for progressive UI rendering.
      </p>
    </article>
  );
}
