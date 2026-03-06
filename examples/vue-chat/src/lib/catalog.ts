/**
 * Shared catalog — used by the server (prompt generation) and the Vue
 * frontend (component registry type).
 *
 * Defines which components the AI can generate and their Zod prop schemas.
 * The same catalog.prompt() call that produces the system prompt also
 * ensures the registry is type-safe.
 */
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/core/schema";
import { z } from "zod";

export const chatCatalog = defineCatalog(schema, {
  components: {
    // ── Layout ──────────────────────────────────────────────────────────────
    Stack: {
      props: z.object({
        direction: z.enum(["vertical", "horizontal"]).nullable(),
        gap: z.number().nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
        wrap: z.boolean().nullable(),
      }),
      slots: ["default"],
      description:
        "Flex layout container. direction='vertical' stacks children top-to-bottom (default), 'horizontal' side-by-side. gap adds spacing.",
    },

    Grid: {
      props: z.object({
        columns: z.number().nullable(),
        gap: z.number().nullable(),
      }),
      slots: ["default"],
      description:
        "CSS grid layout. columns sets the number of equal-width columns (e.g. 2 or 3). gap adds spacing.",
    },

    Card: {
      props: z.object({
        title: z.string().nullable(),
        subtitle: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "Rounded card container with optional title and subtitle. Use to group related information.",
    },

    Divider: {
      props: z.object({}),
      description: "Horizontal rule / visual separator between sections.",
    },

    // ── Typography ───────────────────────────────────────────────────────────
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["1", "2", "3", "4"]).nullable(),
      }),
      description:
        "Section heading. level '1' is largest, '4' is smallest (default '2').",
      example: { text: "Overview", level: "2" },
    },

    Text: {
      props: z.object({
        content: z.string(),
        muted: z.boolean().nullable(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
        weight: z.enum(["normal", "medium", "bold"]).nullable(),
      }),
      description:
        "Inline or block text. muted=true renders in a lighter gray.",
    },

    // ── Data display ─────────────────────────────────────────────────────────
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string().nullable(),
        trend: z.enum(["up", "down", "neutral"]).nullable(),
      }),
      description:
        "Key-value metric tile. trend shows an arrow indicator (up=green, down=red).",
      example: { label: "Stars", value: "12 400", detail: "+120 today", trend: "up" },
    },

    Badge: {
      props: z.object({
        label: z.string(),
        color: z.string().nullable(),
      }),
      description:
        "Small pill-shaped label. color accepts any CSS color string.",
    },

    Table: {
      props: z.object({
        data: z.array(z.record(z.string(), z.unknown())),
        columns: z.array(z.object({ key: z.string(), label: z.string() })),
        emptyMessage: z.string().nullable(),
      }),
      description:
        'Data table. Use { "$state": "/path" } on the data prop to bind read-only data.',
    },

    Callout: {
      props: z.object({
        type: z.enum(["info", "tip", "warning", "important"]).nullable(),
        title: z.string().nullable(),
        content: z.string(),
      }),
      description:
        "Highlighted callout box. type controls the accent color and icon.",
    },

    Timeline: {
      props: z.object({
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string().nullable(),
            date: z.string().nullable(),
            status: z.enum(["completed", "current", "upcoming"]).nullable(),
          }),
        ),
      }),
      description:
        "Vertical timeline for ordered events, history, or step-by-step processes.",
    },

    Accordion: {
      props: z.object({
        items: z.array(z.object({ title: z.string(), content: z.string() })),
      }),
      description:
        "Collapsible sections. items is an array of { title, content } pairs.",
    },

    // ── Charts ───────────────────────────────────────────────────────────────
    BarChart: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(z.record(z.string(), z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        color: z.string().nullable(),
        height: z.number().nullable(),
      }),
      description:
        "Bar chart. xKey = category field, yKey = numeric value field.",
    },

    LineChart: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(z.record(z.string(), z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        color: z.string().nullable(),
        height: z.number().nullable(),
      }),
      description:
        "Line chart for time-series trends.",
    },

    PieChart: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(z.record(z.string(), z.unknown())),
        nameKey: z.string(),
        valueKey: z.string(),
        height: z.number().nullable(),
      }),
      description:
        "Pie / donut chart for proportional data.",
    },

    // ── Interactive ──────────────────────────────────────────────────────────
    Button: {
      props: z.object({
        label: z.string(),
        variant: z
          .enum(["default", "secondary", "destructive", "outline", "ghost"])
          .nullable(),
        size: z.enum(["default", "sm", "lg"]).nullable(),
        disabled: z.boolean().nullable(),
      }),
      description:
        "Clickable button. Use on.press to trigger actions (setState, etc.).",
    },

    TextInput: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        placeholder: z.string().nullable(),
        type: z.enum(["text", "email", "number", "password", "url"]).nullable(),
      }),
      description:
        'Text input. Use { "$bindState": "/path" } for two-way state binding.',
    },

    RadioGroup: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        options: z.array(z.object({ value: z.string(), label: z.string() })),
      }),
      description:
        'Radio buttons for single-selection. Use { "$bindState": "/path" } for two-way binding.',
    },

    SelectInput: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        placeholder: z.string().nullable(),
        options: z.array(z.object({ value: z.string(), label: z.string() })),
      }),
      description:
        'Dropdown select. Use { "$bindState": "/path" } for two-way binding.',
    },

    Progress: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
      }),
      description: "Progress bar. value is 0–100 (or up to max if provided).",
    },

    Link: {
      props: z.object({
        text: z.string(),
        href: z.string(),
      }),
      description: "External link that opens in a new tab.",
    },
  },

  actions: {},
});

export type ChatCatalog = typeof chatCatalog;
