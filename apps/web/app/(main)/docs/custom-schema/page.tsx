import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "Custom Schema & Renderer | json-render",
};

export default function CustomSchemaPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Custom Schema & Renderer</h1>
      <p className="text-muted-foreground mb-8">
        Build your own schema and renderer with{" "}
        <code className="text-foreground">@json-render/core</code>.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Overview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <code className="text-foreground">@json-render/core</code> is
        schema-agnostic. While{" "}
        <code className="text-foreground">@json-render/react</code> provides a
        ready-to-use schema and renderer, you can create your own to match any
        JSON structure - whether it&apos;s a domain-specific format, an existing
        protocol, or something entirely custom.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        1. Define Your Schema
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Start by defining the JSON structure your system will use. Here&apos;s
        an example of a simple dashboard schema:
      </p>
      <Code lang="json">{`{
  "layout": "grid",
  "columns": 2,
  "widgets": [
    {
      "type": "metric",
      "title": "Revenue",
      "value": "$12,345",
      "trend": "up"
    },
    {
      "type": "chart",
      "title": "Sales",
      "chartType": "line",
      "dataKey": "salesData"
    },
    {
      "type": "table",
      "title": "Recent Orders",
      "columns": ["id", "customer", "amount"],
      "dataKey": "orders"
    }
  ]
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        2. Create the Catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define a catalog that describes your components and validates props:
      </p>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const dashboardCatalog = createCatalog({
  components: {
    metric: {
      description: 'Displays a single metric value',
      props: z.object({
        title: z.string(),
        value: z.string(),
        trend: z.enum(['up', 'down', 'flat']).optional(),
        change: z.string().optional(),
      }),
    },
    chart: {
      description: 'Renders a chart visualization',
      props: z.object({
        title: z.string(),
        chartType: z.enum(['line', 'bar', 'pie', 'area']),
        dataKey: z.string(),
        height: z.number().optional(),
      }),
    },
    table: {
      description: 'Displays tabular data',
      props: z.object({
        title: z.string(),
        columns: z.array(z.string()),
        dataKey: z.string(),
        pageSize: z.number().optional(),
      }),
    },
    text: {
      description: 'Displays text content',
      props: z.object({
        content: z.string(),
        variant: z.enum(['heading', 'body', 'caption']).optional(),
      }),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        3. Define the Root Schema
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a schema for the overall document structure:
      </p>
      <Code lang="typescript">{`import { z } from 'zod';

const WidgetSchema = z.object({
  type: z.string(),
  title: z.string().optional(),
  // Additional props validated by catalog
}).passthrough();

export const DashboardSchema = z.object({
  layout: z.enum(['grid', 'stack', 'tabs']),
  columns: z.number().optional(),
  widgets: z.array(WidgetSchema),
});

export type Dashboard = z.infer<typeof DashboardSchema>;
export type Widget = z.infer<typeof WidgetSchema>;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        4. Build the Renderer
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a renderer that maps your schema to React components:
      </p>
      <Code lang="tsx">{`import React from 'react';
import { dashboardCatalog } from './catalog';
import type { Dashboard, Widget } from './schema';

// Widget component registry
const widgetComponents: Record<string, React.FC<any>> = {
  metric: ({ title, value, trend, change }) => (
    <div className="p-4 rounded-lg border">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {trend && (
        <p className={\`text-sm \${trend === 'up' ? 'text-green-500' : 'text-red-500'}\`}>
          {trend === 'up' ? '+' : '-'}{change}
        </p>
      )}
    </div>
  ),

  chart: ({ title, chartType, data }) => (
    <div className="p-4 rounded-lg border">
      <p className="font-medium mb-2">{title}</p>
      <div className="h-48 bg-muted rounded flex items-center justify-center">
        {/* Your chart library here */}
        <span className="text-muted-foreground">{chartType} chart</span>
      </div>
    </div>
  ),

  table: ({ title, columns, data }) => (
    <div className="p-4 rounded-lg border">
      <p className="font-medium mb-2">{title}</p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col: string) => (
              <th key={col} className="text-left p-2 border-b">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row: any, i: number) => (
            <tr key={i}>
              {columns.map((col: string) => (
                <td key={col} className="p-2 border-b">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),

  text: ({ content, variant = 'body' }) => {
    const className = {
      heading: 'text-xl font-bold',
      body: 'text-base',
      caption: 'text-sm text-muted-foreground',
    }[variant];
    return <p className={className}>{content}</p>;
  },
};

// Main renderer
export function DashboardRenderer({
  spec,
  data = {},
}: {
  spec: Dashboard;
  data?: Record<string, any>;
}) {
  const layoutClass = {
    grid: \`grid gap-4 \${spec.columns ? \`grid-cols-\${spec.columns}\` : 'grid-cols-2'}\`,
    stack: 'flex flex-col gap-4',
    tabs: 'space-y-4',
  }[spec.layout];

  return (
    <div className={layoutClass}>
      {spec.widgets.map((widget, index) => {
        const Component = widgetComponents[widget.type];
        if (!Component) {
          console.warn(\`Unknown widget type: \${widget.type}\`);
          return null;
        }

        // Resolve data references
        const widgetData = widget.dataKey ? data[widget.dataKey] : undefined;

        return (
          <Component
            key={index}
            {...widget}
            data={widgetData}
          />
        );
      })}
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        5. Generate LLM Prompts
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use the catalog to generate system prompts for AI:
      </p>
      <Code lang="typescript">{`const systemPrompt = dashboardCatalog.prompt({
  customRules: [
    'Use metric widgets for single KPI values',
    'Use chart widgets for time-series data',
    'Use table widgets for lists of records',
    'Limit dashboards to 6 widgets maximum',
  ],
});

// Use with any LLM
const response = await generateText({
  model: 'gpt-4',
  system: systemPrompt,
  prompt: 'Create a sales dashboard with revenue, orders, and a chart',
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">6. Validate Specs</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Validate incoming specs against your schema:
      </p>
      <Code lang="typescript">{`import { validate } from '@json-render/core';

function validateDashboard(spec: unknown) {
  // Validate root structure
  const rootResult = DashboardSchema.safeParse(spec);
  if (!rootResult.success) {
    return { valid: false, errors: rootResult.error.errors };
  }

  // Validate each widget against catalog
  const errors: string[] = [];
  for (const widget of rootResult.data.widgets) {
    const result = validate(
      { type: widget.type, props: widget },
      dashboardCatalog
    );
    if (!result.valid) {
      errors.push(...result.errors.map(e => \`\${widget.type}: \${e}\`));
    }
  }

  return { valid: errors.length === 0, errors };
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Usage Example</h2>
      <Code lang="tsx">{`'use client';

import { useState } from 'react';
import { DashboardRenderer } from './renderer';
import type { Dashboard } from './schema';

const initialSpec: Dashboard = {
  layout: 'grid',
  columns: 2,
  widgets: [
    { type: 'metric', title: 'Revenue', value: '$12,345', trend: 'up' },
    { type: 'metric', title: 'Orders', value: '156', trend: 'up' },
    { type: 'chart', title: 'Sales Trend', chartType: 'line', dataKey: 'sales' },
    { type: 'table', title: 'Recent Orders', columns: ['id', 'customer', 'amount'], dataKey: 'orders' },
  ],
};

const data = {
  sales: [/* chart data */],
  orders: [
    { id: '001', customer: 'Acme Inc', amount: '$500' },
    { id: '002', customer: 'Globex', amount: '$750' },
  ],
};

export function MyDashboard() {
  const [spec, setSpec] = useState(initialSpec);

  return <DashboardRenderer spec={spec} data={data} />;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        See how to integrate with{" "}
        <Link href="/docs/a2ui" className="text-foreground hover:underline">
          A2UI
        </Link>{" "}
        or{" "}
        <Link
          href="/docs/adaptive-cards"
          className="text-foreground hover:underline"
        >
          Adaptive Cards
        </Link>{" "}
        protocols.
      </p>
    </article>
  );
}
