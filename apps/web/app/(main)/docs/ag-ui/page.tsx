import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "AG-UI Integration | json-render",
};

export default function AGUIPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">AG-UI Integration</h1>
      <p className="text-muted-foreground mb-8">
        Use json-render to support{" "}
        <a
          href="https://docs.copilotkit.ai/ag-ui"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          AG-UI
        </a>{" "}
        (Agent User Interaction Protocol) from CopilotKit.
      </p>

      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 mb-8">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Concept:</strong> This page demonstrates how json-render can
          support AG-UI. The examples are illustrative and may require
          adaptation for production use.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-4">What is AG-UI?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AG-UI is an open protocol for connecting AI agents to user interfaces.
        It provides a standardized way for agents to render UI components,
        handle user input, and manage state. The protocol uses events streamed
        over HTTP to update the UI in real-time.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">AG-UI Event Types</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AG-UI defines several event types for agent-UI communication:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <code className="text-foreground">TEXT_MESSAGE_START</code> /{" "}
          <code className="text-foreground">TEXT_MESSAGE_CONTENT</code> /{" "}
          <code className="text-foreground">TEXT_MESSAGE_END</code> — Streaming
          text messages
        </li>
        <li>
          <code className="text-foreground">TOOL_CALL_START</code> /{" "}
          <code className="text-foreground">TOOL_CALL_ARGS</code> /{" "}
          <code className="text-foreground">TOOL_CALL_END</code> — Tool/function
          calls
        </li>
        <li>
          <code className="text-foreground">STATE_SNAPSHOT</code> /{" "}
          <code className="text-foreground">STATE_DELTA</code> — State updates
        </li>
        <li>
          <code className="text-foreground">CUSTOM</code> — Custom events for UI
          rendering
        </li>
      </ul>

      <h3 className="text-lg font-medium mt-8 mb-3">
        Example AG-UI Event Stream
      </h3>
      <Code lang="json">{`{"type": "RUN_STARTED", "threadId": "thread-123", "runId": "run-456"}
{"type": "TEXT_MESSAGE_START", "messageId": "msg-1", "role": "assistant"}
{"type": "TEXT_MESSAGE_CONTENT", "messageId": "msg-1", "delta": "Here's a dashboard for you:"}
{"type": "TEXT_MESSAGE_END", "messageId": "msg-1"}
{"type": "TOOL_CALL_START", "toolCallId": "tc-1", "toolCallName": "render_ui"}
{"type": "TOOL_CALL_ARGS", "toolCallId": "tc-1", "delta": "{\\"component\\": \\"Dashboard\\", \\"props\\": {\\"title\\": \\"Sales\\"}}"}
{"type": "TOOL_CALL_END", "toolCallId": "tc-1"}
{"type": "RUN_FINISHED"}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Define the AG-UI Schema
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define schemas for AG-UI event types:
      </p>
      <Code lang="typescript">{`import { z } from 'zod';

// Base event schema
const BaseEvent = z.object({
  type: z.string(),
  timestamp: z.number().optional(),
});

// Text message events
const TextMessageStart = BaseEvent.extend({
  type: z.literal('TEXT_MESSAGE_START'),
  messageId: z.string(),
  role: z.enum(['user', 'assistant']),
});

const TextMessageContent = BaseEvent.extend({
  type: z.literal('TEXT_MESSAGE_CONTENT'),
  messageId: z.string(),
  delta: z.string(),
});

const TextMessageEnd = BaseEvent.extend({
  type: z.literal('TEXT_MESSAGE_END'),
  messageId: z.string(),
});

// Tool call events
const ToolCallStart = BaseEvent.extend({
  type: z.literal('TOOL_CALL_START'),
  toolCallId: z.string(),
  toolCallName: z.string(),
  parentMessageId: z.string().optional(),
});

const ToolCallArgs = BaseEvent.extend({
  type: z.literal('TOOL_CALL_ARGS'),
  toolCallId: z.string(),
  delta: z.string(),
});

const ToolCallEnd = BaseEvent.extend({
  type: z.literal('TOOL_CALL_END'),
  toolCallId: z.string(),
});

// State events
const StateSnapshot = BaseEvent.extend({
  type: z.literal('STATE_SNAPSHOT'),
  snapshot: z.record(z.unknown()),
});

const StateDelta = BaseEvent.extend({
  type: z.literal('STATE_DELTA'),
  delta: z.array(z.object({
    op: z.enum(['add', 'remove', 'replace']),
    path: z.string(),
    value: z.unknown().optional(),
  })),
});

// Custom event for UI components
const CustomEvent = BaseEvent.extend({
  type: z.literal('CUSTOM'),
  name: z.string(),
  value: z.unknown(),
});

// Run lifecycle events
const RunStarted = BaseEvent.extend({
  type: z.literal('RUN_STARTED'),
  threadId: z.string(),
  runId: z.string(),
});

const RunFinished = BaseEvent.extend({
  type: z.literal('RUN_FINISHED'),
});

const RunError = BaseEvent.extend({
  type: z.literal('RUN_ERROR'),
  message: z.string(),
  code: z.string().optional(),
});

// Union of all events
export const AGUIEvent = z.discriminatedUnion('type', [
  TextMessageStart,
  TextMessageContent,
  TextMessageEnd,
  ToolCallStart,
  ToolCallArgs,
  ToolCallEnd,
  StateSnapshot,
  StateDelta,
  CustomEvent,
  RunStarted,
  RunFinished,
  RunError,
]);

export type AGUIEvent = z.infer<typeof AGUIEvent>;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Define the AG-UI Catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a catalog for UI components that agents can render:
      </p>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const aguiCatalog = createCatalog({
  components: {
    // Layout components
    Container: {
      description: 'A container for grouping elements',
      props: z.object({
        direction: z.enum(['row', 'column']).optional(),
        gap: z.enum(['none', 'sm', 'md', 'lg']).optional(),
        padding: z.enum(['none', 'sm', 'md', 'lg']).optional(),
      }),
    },

    Card: {
      description: 'A card with optional title',
      props: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    },

    // Content components
    Text: {
      description: 'Text content',
      props: z.object({
        content: z.string(),
        variant: z.enum(['body', 'heading', 'caption', 'code']).optional(),
      }),
    },

    Markdown: {
      description: 'Renders markdown content',
      props: z.object({
        content: z.string(),
      }),
    },

    Image: {
      description: 'Displays an image',
      props: z.object({
        src: z.string(),
        alt: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    },

    // Data display
    Table: {
      description: 'Displays tabular data',
      props: z.object({
        columns: z.array(z.object({
          key: z.string(),
          header: z.string(),
          width: z.string().optional(),
        })),
        data: z.array(z.record(z.unknown())),
      }),
    },

    Chart: {
      description: 'Renders a chart',
      props: z.object({
        type: z.enum(['line', 'bar', 'pie', 'area']),
        data: z.array(z.record(z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        title: z.string().optional(),
      }),
    },

    Metric: {
      description: 'Displays a metric value',
      props: z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        change: z.number().optional(),
        format: z.enum(['number', 'currency', 'percent']).optional(),
      }),
    },

    // Input components
    Button: {
      description: 'Interactive button',
      props: z.object({
        label: z.string(),
        variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
        disabled: z.boolean().optional(),
      }),
    },

    Input: {
      description: 'Text input field',
      props: z.object({
        name: z.string(),
        label: z.string().optional(),
        placeholder: z.string().optional(),
        type: z.enum(['text', 'email', 'password', 'number']).optional(),
        required: z.boolean().optional(),
      }),
    },

    Select: {
      description: 'Dropdown select',
      props: z.object({
        name: z.string(),
        label: z.string().optional(),
        options: z.array(z.object({
          value: z.string(),
          label: z.string(),
        })),
        placeholder: z.string().optional(),
      }),
    },

    Form: {
      description: 'Form container',
      props: z.object({
        id: z.string(),
        submitLabel: z.string().optional(),
      }),
    },

    // Feedback components
    Alert: {
      description: 'Alert message',
      props: z.object({
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error']).optional(),
      }),
    },

    Progress: {
      description: 'Progress indicator',
      props: z.object({
        value: z.number(),
        max: z.number().optional(),
        label: z.string().optional(),
      }),
    },

    Skeleton: {
      description: 'Loading placeholder',
      props: z.object({
        width: z.string().optional(),
        height: z.string().optional(),
        variant: z.enum(['text', 'circular', 'rectangular']).optional(),
      }),
    },
  },

  actions: {
    submit: {
      description: 'Submit form data',
      params: z.object({
        formId: z.string(),
      }),
    },
    navigate: {
      description: 'Navigate to a URL',
      params: z.object({
        url: z.string(),
      }),
    },
    callback: {
      description: 'Trigger a callback to the agent',
      params: z.object({
        name: z.string(),
        data: z.record(z.unknown()).optional(),
      }),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Build an AG-UI Event Processor
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Process AG-UI events and render UI components:
      </p>
      <Code lang="tsx">{`'use client';

import React, { useState, useCallback } from 'react';
import { AGUIEvent } from './schema';

interface AGUIState {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>;
  toolCalls: Map<string, {
    name: string;
    args: string;
    result?: unknown;
  }>;
  state: Record<string, unknown>;
  isRunning: boolean;
}

export function useAGUI() {
  const [aguiState, setAGUIState] = useState<AGUIState>({
    messages: [],
    toolCalls: new Map(),
    state: {},
    isRunning: false,
  });

  const processEvent = useCallback((event: AGUIEvent) => {
    switch (event.type) {
      case 'RUN_STARTED':
        setAGUIState(prev => ({ ...prev, isRunning: true }));
        break;

      case 'RUN_FINISHED':
        setAGUIState(prev => ({ ...prev, isRunning: false }));
        break;

      case 'TEXT_MESSAGE_START':
        setAGUIState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: event.messageId,
            role: event.role,
            content: '',
          }],
        }));
        break;

      case 'TEXT_MESSAGE_CONTENT':
        setAGUIState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === event.messageId
              ? { ...msg, content: msg.content + event.delta }
              : msg
          ),
        }));
        break;

      case 'TOOL_CALL_START':
        setAGUIState(prev => {
          const toolCalls = new Map(prev.toolCalls);
          toolCalls.set(event.toolCallId, { name: event.toolCallName, args: '' });
          return { ...prev, toolCalls };
        });
        break;

      case 'TOOL_CALL_ARGS':
        setAGUIState(prev => {
          const toolCalls = new Map(prev.toolCalls);
          const tc = toolCalls.get(event.toolCallId);
          if (tc) {
            toolCalls.set(event.toolCallId, { ...tc, args: tc.args + event.delta });
          }
          return { ...prev, toolCalls };
        });
        break;

      case 'STATE_SNAPSHOT':
        setAGUIState(prev => ({ ...prev, state: event.snapshot }));
        break;

      case 'STATE_DELTA':
        setAGUIState(prev => {
          const newState = { ...prev.state };
          for (const op of event.delta) {
            const parts = op.path.split('/').filter(Boolean);
            if (op.op === 'replace' || op.op === 'add') {
              let obj: any = newState;
              for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]] = obj[parts[i]] || {};
              }
              obj[parts[parts.length - 1]] = op.value;
            } else if (op.op === 'remove') {
              let obj: any = newState;
              for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]];
                if (!obj) break;
              }
              if (obj) delete obj[parts[parts.length - 1]];
            }
          }
          return { ...prev, state: newState };
        });
        break;
    }
  }, []);

  return { state: aguiState, processEvent };
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Rendering Tool Call Results as UI
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        When an agent calls a <code className="text-foreground">render_ui</code>{" "}
        tool, parse the arguments and render the component:
      </p>
      <Code lang="tsx">{`import { aguiCatalog } from './catalog';

// Component registry
const components: Record<string, React.FC<any>> = {
  Container: ({ direction = 'column', gap = 'md', children }) => (
    <div className={\`flex flex-\${direction} gap-\${gap}\`}>{children}</div>
  ),
  Card: ({ title, description, children }) => (
    <div className="border rounded-lg p-4">
      {title && <h3 className="font-semibold">{title}</h3>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      {children}
    </div>
  ),
  Text: ({ content, variant = 'body' }) => {
    const styles = {
      body: 'text-sm',
      heading: 'text-lg font-semibold',
      caption: 'text-xs text-muted-foreground',
      code: 'font-mono text-sm bg-muted px-1 rounded',
    };
    return <p className={styles[variant]}>{content}</p>;
  },
  Button: ({ label, variant = 'primary', onClick }) => (
    <button
      className={\`px-4 py-2 rounded text-sm \${
        variant === 'primary' ? 'bg-primary text-primary-foreground' :
        variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
        'border'
      }\`}
      onClick={onClick}
    >
      {label}
    </button>
  ),
  Metric: ({ label, value, change, format }) => {
    const formatted = format === 'currency' ? \`$\${value.toLocaleString()}\` :
                      format === 'percent' ? \`\${value}%\` :
                      value.toLocaleString();
    return (
      <div className="p-4 border rounded">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{formatted}</p>
        {change !== undefined && (
          <p className={\`text-sm \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
    );
  },
  Alert: ({ message, type = 'info' }) => {
    const styles = {
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      error: 'bg-red-50 text-red-800 border-red-200',
    };
    return <div className={\`p-3 rounded border \${styles[type]}\`}>{message}</div>;
  },
  // Add more components...
};

// Render tool call result
export function renderToolCallUI(toolCall: { name: string; args: string }) {
  if (toolCall.name !== 'render_ui') return null;

  try {
    const parsed = JSON.parse(toolCall.args);
    const Component = components[parsed.component];
    if (!Component) return null;

    return <Component {...parsed.props} />;
  } catch {
    return null;
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Usage Example</h2>
      <Code lang="tsx">{`'use client';

import { useAGUI } from './use-agui';
import { renderToolCallUI } from './renderer';

export function AGUIChat() {
  const { state, processEvent } = useAGUI();

  // Connect to AG-UI event stream
  async function startRun(prompt: string) {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\\n').filter(Boolean);
      for (const line of lines) {
        const event = JSON.parse(line);
        processEvent(event);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {state.messages.map(msg => (
        <div key={msg.id} className={\`p-3 rounded \${
          msg.role === 'assistant' ? 'bg-muted' : 'bg-primary/10'
        }\`}>
          {msg.content}
        </div>
      ))}

      {/* Rendered UI from tool calls */}
      {Array.from(state.toolCalls.values()).map((tc, i) => (
        <div key={i}>{renderToolCallUI(tc)}</div>
      ))}

      {/* Input */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector('input');
        if (input?.value) {
          startRun(input.value);
          input.value = '';
        }
      }}>
        <input
          type="text"
          placeholder="Ask the agent..."
          className="w-full px-4 py-2 border rounded"
          disabled={state.isRunning}
        />
      </form>
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link href="/docs/openapi" className="text-foreground hover:underline">
          OpenAPI integration
        </Link>{" "}
        for rendering forms from API schemas.
      </p>
    </article>
  );
}
