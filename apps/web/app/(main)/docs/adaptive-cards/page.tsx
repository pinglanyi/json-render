import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "Adaptive Cards Integration | json-render",
};

export default function AdaptiveCardsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">Adaptive Cards Integration</h1>
      <p className="text-muted-foreground mb-8">
        Use json-render to render{" "}
        <a
          href="https://adaptivecards.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          Microsoft Adaptive Cards
        </a>{" "}
        natively.
      </p>

      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 mb-8">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Concept:</strong> This page demonstrates how json-render can
          support Adaptive Cards. The examples are illustrative and may require
          adaptation for production use.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Adaptive Cards Overview
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Adaptive Cards is a JSON-based format for platform-agnostic UI snippets.
        Cards have a <code className="text-foreground">body</code> array of
        elements and an optional{" "}
        <code className="text-foreground">actions</code> array for interactive
        buttons.
      </p>

      <h3 className="text-lg font-medium mt-8 mb-3">Example Adaptive Card</h3>
      <Code lang="json">{`{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "text": "Hello, Adaptive Cards!",
      "size": "large",
      "weight": "bolder"
    },
    {
      "type": "Image",
      "url": "https://example.com/image.png",
      "altText": "Example image"
    },
    {
      "type": "Container",
      "items": [
        {
          "type": "TextBlock",
          "text": "This is inside a container",
          "wrap": true
        }
      ]
    },
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "auto",
          "items": [
            { "type": "TextBlock", "text": "Column 1" }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "Column 2" }
          ]
        }
      ]
    },
    {
      "type": "Input.Text",
      "id": "userInput",
      "placeholder": "Enter your name",
      "label": "Name"
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit"
    },
    {
      "type": "Action.OpenUrl",
      "title": "Learn More",
      "url": "https://adaptivecards.io"
    }
  ]
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Creating an Adaptive Cards Catalog
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define a catalog matching the Adaptive Cards element types:
      </p>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

// Common Adaptive Cards properties
const Spacing = z.enum(['none', 'small', 'default', 'medium', 'large', 'extraLarge', 'padding']);
const HorizontalAlignment = z.enum(['left', 'center', 'right']);
const VerticalAlignment = z.enum(['top', 'center', 'bottom']);
const FontSize = z.enum(['small', 'default', 'medium', 'large', 'extraLarge']);
const FontWeight = z.enum(['lighter', 'default', 'bolder']);
const ImageSize = z.enum(['auto', 'stretch', 'small', 'medium', 'large']);
const ImageStyle = z.enum(['default', 'person']);

// Base element properties shared by most elements
const BaseElement = {
  id: z.string().optional(),
  isVisible: z.boolean().optional(),
  separator: z.boolean().optional(),
  spacing: Spacing.optional(),
};

export const adaptiveCardsCatalog = createCatalog({
  components: {
    // Root card
    AdaptiveCard: {
      description: 'Root Adaptive Card container',
      props: z.object({
        version: z.string(),
        body: z.array(z.unknown()).optional(),
        actions: z.array(z.unknown()).optional(),
        fallbackText: z.string().optional(),
        minHeight: z.string().optional(),
        rtl: z.boolean().optional(),
        verticalContentAlignment: VerticalAlignment.optional(),
      }),
    },

    // Elements
    TextBlock: {
      description: 'Displays text with formatting options',
      props: z.object({
        ...BaseElement,
        text: z.string(),
        color: z.enum(['default', 'dark', 'light', 'accent', 'good', 'warning', 'attention']).optional(),
        fontType: z.enum(['default', 'monospace']).optional(),
        horizontalAlignment: HorizontalAlignment.optional(),
        isSubtle: z.boolean().optional(),
        maxLines: z.number().optional(),
        size: FontSize.optional(),
        weight: FontWeight.optional(),
        wrap: z.boolean().optional(),
      }),
    },

    Image: {
      description: 'Displays an image',
      props: z.object({
        ...BaseElement,
        url: z.string(),
        altText: z.string().optional(),
        backgroundColor: z.string().optional(),
        height: z.string().optional(),
        width: z.string().optional(),
        horizontalAlignment: HorizontalAlignment.optional(),
        size: ImageSize.optional(),
        style: ImageStyle.optional(),
      }),
    },

    Container: {
      description: 'Groups elements together',
      props: z.object({
        ...BaseElement,
        items: z.array(z.unknown()),
        style: z.enum(['default', 'emphasis', 'good', 'attention', 'warning', 'accent']).optional(),
        verticalContentAlignment: VerticalAlignment.optional(),
        bleed: z.boolean().optional(),
        minHeight: z.string().optional(),
      }),
    },

    ColumnSet: {
      description: 'Arranges columns horizontally',
      props: z.object({
        ...BaseElement,
        columns: z.array(z.unknown()),
        horizontalAlignment: HorizontalAlignment.optional(),
        minHeight: z.string().optional(),
      }),
    },

    Column: {
      description: 'A column within a ColumnSet',
      props: z.object({
        ...BaseElement,
        items: z.array(z.unknown()).optional(),
        width: z.union([z.string(), z.number()]).optional(),
        style: z.enum(['default', 'emphasis', 'good', 'attention', 'warning', 'accent']).optional(),
        verticalContentAlignment: VerticalAlignment.optional(),
      }),
    },

    FactSet: {
      description: 'Displays a series of facts as key/value pairs',
      props: z.object({
        ...BaseElement,
        facts: z.array(z.object({
          title: z.string(),
          value: z.string(),
        })),
      }),
    },

    ImageSet: {
      description: 'Displays a collection of images',
      props: z.object({
        ...BaseElement,
        images: z.array(z.object({
          type: z.literal('Image'),
          url: z.string(),
          altText: z.string().optional(),
        })),
        imageSize: ImageSize.optional(),
      }),
    },

    ActionSet: {
      description: 'Displays a set of actions',
      props: z.object({
        ...BaseElement,
        actions: z.array(z.unknown()),
      }),
    },

    RichTextBlock: {
      description: 'Rich text with inline formatting',
      props: z.object({
        ...BaseElement,
        inlines: z.array(z.unknown()),
        horizontalAlignment: HorizontalAlignment.optional(),
      }),
    },

    // Inputs
    'Input.Text': {
      description: 'Text input field',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        isMultiline: z.boolean().optional(),
        maxLength: z.number().optional(),
        placeholder: z.string().optional(),
        label: z.string().optional(),
        value: z.string().optional(),
        style: z.enum(['text', 'tel', 'url', 'email', 'password']).optional(),
        isRequired: z.boolean().optional(),
        errorMessage: z.string().optional(),
      }),
    },

    'Input.Number': {
      description: 'Number input field',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        max: z.number().optional(),
        min: z.number().optional(),
        placeholder: z.string().optional(),
        label: z.string().optional(),
        value: z.number().optional(),
        isRequired: z.boolean().optional(),
        errorMessage: z.string().optional(),
      }),
    },

    'Input.Date': {
      description: 'Date picker input',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        max: z.string().optional(),
        min: z.string().optional(),
        placeholder: z.string().optional(),
        label: z.string().optional(),
        value: z.string().optional(),
        isRequired: z.boolean().optional(),
      }),
    },

    'Input.Time': {
      description: 'Time picker input',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        max: z.string().optional(),
        min: z.string().optional(),
        placeholder: z.string().optional(),
        label: z.string().optional(),
        value: z.string().optional(),
        isRequired: z.boolean().optional(),
      }),
    },

    'Input.Toggle': {
      description: 'Toggle/checkbox input',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        title: z.string(),
        label: z.string().optional(),
        value: z.string().optional(),
        valueOff: z.string().optional(),
        valueOn: z.string().optional(),
        isRequired: z.boolean().optional(),
      }),
    },

    'Input.ChoiceSet': {
      description: 'Dropdown or radio/checkbox group',
      props: z.object({
        ...BaseElement,
        id: z.string(),
        choices: z.array(z.object({
          title: z.string(),
          value: z.string(),
        })),
        isMultiSelect: z.boolean().optional(),
        style: z.enum(['compact', 'expanded']).optional(),
        label: z.string().optional(),
        value: z.string().optional(),
        placeholder: z.string().optional(),
        isRequired: z.boolean().optional(),
      }),
    },

    // Actions
    'Action.OpenUrl': {
      description: 'Opens a URL',
      props: z.object({
        title: z.string().optional(),
        url: z.string(),
        iconUrl: z.string().optional(),
      }),
    },

    'Action.Submit': {
      description: 'Submits input data',
      props: z.object({
        title: z.string().optional(),
        data: z.unknown().optional(),
        iconUrl: z.string().optional(),
      }),
    },

    'Action.ShowCard': {
      description: 'Shows a card inline',
      props: z.object({
        title: z.string().optional(),
        card: z.unknown(),
        iconUrl: z.string().optional(),
      }),
    },

    'Action.ToggleVisibility': {
      description: 'Toggles visibility of elements',
      props: z.object({
        title: z.string().optional(),
        targetElements: z.array(z.union([
          z.string(),
          z.object({ elementId: z.string(), isVisible: z.boolean().optional() }),
        ])),
        iconUrl: z.string().optional(),
      }),
    },

    'Action.Execute': {
      description: 'Universal action for bots',
      props: z.object({
        title: z.string().optional(),
        verb: z.string().optional(),
        data: z.unknown().optional(),
        iconUrl: z.string().optional(),
      }),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Building an Adaptive Cards Renderer
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a renderer that processes Adaptive Cards JSON:
      </p>
      <Code lang="tsx">{`'use client';

import React from 'react';

interface AdaptiveCardElement {
  type: string;
  [key: string]: unknown;
}

interface AdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body?: AdaptiveCardElement[];
  actions?: AdaptiveCardElement[];
}

interface RenderContext {
  onAction: (action: AdaptiveCardElement, data: Record<string, unknown>) => void;
  inputs: Record<string, unknown>;
  setInput: (id: string, value: unknown) => void;
}

// Widget registry for Adaptive Cards elements
const widgets: Record<string, React.FC<any>> = {
  TextBlock: ({ text, size, weight, color, isSubtle, wrap, horizontalAlignment }) => {
    const sizeClass = {
      small: 'text-xs',
      default: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      extraLarge: 'text-2xl',
    }[size || 'default'];

    const weightClass = {
      lighter: 'font-light',
      default: 'font-normal',
      bolder: 'font-bold',
    }[weight || 'default'];

    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[horizontalAlignment || 'left'];

    return (
      <p className={\`\${sizeClass} \${weightClass} \${alignClass} \${isSubtle ? 'text-muted-foreground' : ''} \${wrap !== false ? '' : 'truncate'}\`}>
        {text}
      </p>
    );
  },

  Image: ({ url, altText, size, style, horizontalAlignment }) => {
    const sizeClass = {
      auto: '',
      stretch: 'w-full',
      small: 'w-16',
      medium: 'w-32',
      large: 'w-48',
    }[size || 'auto'];

    return (
      <div className={\`flex \${horizontalAlignment === 'center' ? 'justify-center' : horizontalAlignment === 'right' ? 'justify-end' : ''}\`}>
        <img
          src={url}
          alt={altText || ''}
          className={\`\${sizeClass} \${style === 'person' ? 'rounded-full' : ''}\`}
        />
      </div>
    );
  },

  Container: ({ items, style, children, ctx }) => {
    const styleClass = {
      default: '',
      emphasis: 'bg-muted p-2 rounded',
      good: 'bg-green-50 p-2 rounded',
      attention: 'bg-red-50 p-2 rounded',
      warning: 'bg-yellow-50 p-2 rounded',
      accent: 'bg-blue-50 p-2 rounded',
    }[style || 'default'];

    return (
      <div className={\`\${styleClass} space-y-2\`}>
        {children || items?.map((item: any, i: number) => (
          <AdaptiveElement key={i} element={item} ctx={ctx} />
        ))}
      </div>
    );
  },

  ColumnSet: ({ columns, ctx }) => (
    <div className="flex gap-2">
      {columns?.map((col: any, i: number) => (
        <AdaptiveElement key={i} element={{ ...col, type: 'Column' }} ctx={ctx} />
      ))}
    </div>
  ),

  Column: ({ items, width, style, ctx }) => {
    const widthClass = width === 'auto' ? 'flex-none' :
                       width === 'stretch' ? 'flex-1' :
                       typeof width === 'number' ? \`flex-[\${width}]\` : 'flex-1';
    return (
      <div className={\`\${widthClass} space-y-2\`}>
        {items?.map((item: any, i: number) => (
          <AdaptiveElement key={i} element={item} ctx={ctx} />
        ))}
      </div>
    );
  },

  FactSet: ({ facts }) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {facts?.map((fact: any, i: number) => (
        <React.Fragment key={i}>
          <span className="font-medium">{fact.title}</span>
          <span>{fact.value}</span>
        </React.Fragment>
      ))}
    </div>
  ),

  ActionSet: ({ actions, ctx }) => (
    <div className="flex gap-2 pt-2">
      {actions?.map((action: any, i: number) => (
        <AdaptiveElement key={i} element={action} ctx={ctx} />
      ))}
    </div>
  ),

  'Input.Text': ({ id, placeholder, label, isMultiline, value, ctx }) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      {isMultiline ? (
        <textarea
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder={placeholder}
          defaultValue={value}
          onChange={(e) => ctx.setInput(id, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder={placeholder}
          defaultValue={value}
          onChange={(e) => ctx.setInput(id, e.target.value)}
        />
      )}
    </div>
  ),

  'Input.Number': ({ id, placeholder, label, min, max, value, ctx }) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="number"
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder={placeholder}
        min={min}
        max={max}
        defaultValue={value}
        onChange={(e) => ctx.setInput(id, parseFloat(e.target.value))}
      />
    </div>
  ),

  'Input.Toggle': ({ id, title, label, valueOn = 'true', valueOff = 'false', value, ctx }) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        defaultChecked={value === valueOn}
        onChange={(e) => ctx.setInput(id, e.target.checked ? valueOn : valueOff)}
      />
      <label htmlFor={id} className="text-sm">{title || label}</label>
    </div>
  ),

  'Input.ChoiceSet': ({ id, choices, isMultiSelect, style, label, placeholder, ctx }) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      {style === 'expanded' ? (
        <div className="space-y-1">
          {choices?.map((choice: any, i: number) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input
                type={isMultiSelect ? 'checkbox' : 'radio'}
                name={id}
                value={choice.value}
                onChange={(e) => ctx.setInput(id, e.target.value)}
              />
              {choice.title}
            </label>
          ))}
        </div>
      ) : (
        <select
          className="w-full px-3 py-2 border rounded text-sm"
          onChange={(e) => ctx.setInput(id, e.target.value)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {choices?.map((choice: any, i: number) => (
            <option key={i} value={choice.value}>{choice.title}</option>
          ))}
        </select>
      )}
    </div>
  ),

  'Action.Submit': ({ title, data, ctx }) => (
    <button
      className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
      onClick={() => ctx.onAction({ type: 'Action.Submit', data }, ctx.inputs)}
    >
      {title || 'Submit'}
    </button>
  ),

  'Action.OpenUrl': ({ title, url }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 border rounded text-sm hover:bg-muted"
    >
      {title || 'Open'}
    </a>
  ),

  'Action.Execute': ({ title, verb, data, ctx }) => (
    <button
      className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
      onClick={() => ctx.onAction({ type: 'Action.Execute', verb, data }, ctx.inputs)}
    >
      {title || 'Execute'}
    </button>
  ),
};

function AdaptiveElement({ element, ctx }: { element: AdaptiveCardElement; ctx: RenderContext }) {
  const Widget = widgets[element.type];
  if (!Widget) {
    console.warn(\`Unknown Adaptive Card element: \${element.type}\`);
    return null;
  }
  return <Widget {...element} ctx={ctx} />;
}

export function AdaptiveCardRenderer({
  card,
  onAction,
}: {
  card: AdaptiveCard;
  onAction?: (action: AdaptiveCardElement, data: Record<string, unknown>) => void;
}) {
  const [inputs, setInputs] = React.useState<Record<string, unknown>>({});

  const ctx: RenderContext = {
    onAction: onAction || (() => {}),
    inputs,
    setInput: (id, value) => setInputs((prev) => ({ ...prev, [id]: value })),
  };

  return (
    <div className="rounded-lg border p-4 space-y-3 max-w-md">
      {card.body?.map((element, i) => (
        <AdaptiveElement key={i} element={element} ctx={ctx} />
      ))}
      {card.actions && card.actions.length > 0 && (
        <div className="flex gap-2 pt-2 border-t">
          {card.actions.map((action, i) => (
            <AdaptiveElement key={i} element={action} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Usage Example</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Render an Adaptive Card and handle actions:
      </p>
      <Code lang="tsx">{`'use client';

import { AdaptiveCardRenderer } from './adaptive-card-renderer';

const card = {
  type: 'AdaptiveCard' as const,
  version: '1.5',
  body: [
    {
      type: 'TextBlock',
      text: 'Contact Form',
      size: 'large',
      weight: 'bolder',
    },
    {
      type: 'Input.Text',
      id: 'name',
      label: 'Your Name',
      placeholder: 'Enter your name',
    },
    {
      type: 'Input.Text',
      id: 'message',
      label: 'Message',
      placeholder: 'Enter your message',
      isMultiline: true,
    },
  ],
  actions: [
    {
      type: 'Action.Submit',
      title: 'Send',
      data: { action: 'submitForm' },
    },
  ],
};

export function ContactCard() {
  const handleAction = (action: any, inputData: Record<string, unknown>) => {
    console.log('Action:', action);
    console.log('Input data:', inputData);
    
    // Send to your backend
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data: inputData }),
    });
  };

  return <AdaptiveCardRenderer card={card} onAction={handleAction} />;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Handling Action.Execute for Bots
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        For bot scenarios, handle{" "}
        <code className="text-foreground">Action.Execute</code> with the verb
        and data:
      </p>
      <Code lang="typescript">{`interface ActionExecutePayload {
  action: {
    type: 'Action.Execute';
    verb: string;
    data?: unknown;
  };
  inputs: Record<string, unknown>;
}

async function handleBotAction(payload: ActionExecutePayload) {
  const response = await fetch('/api/bot/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verb: payload.action.verb,
      data: payload.action.data,
      inputs: payload.inputs,
    }),
  });
  
  // Bot may return a new card to render
  const result = await response.json();
  if (result.card) {
    return result.card; // New AdaptiveCard to render
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link href="/docs/a2ui" className="text-foreground hover:underline">
          A2UI integration
        </Link>{" "}
        for another agent-driven UI protocol.
      </p>
    </article>
  );
}
