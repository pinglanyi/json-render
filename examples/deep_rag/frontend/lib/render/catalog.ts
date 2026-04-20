import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";

/**
 * Deep RAG component catalog.
 *
 * Focused on presenting RAG results: answers, retrieved chunks, source
 * citations, document links, and knowledge-base metrics.
 */
export const ragCatalog = defineCatalog(schema, {
  components: {
    // ── Layout & structure (from @json-render/shadcn) ──────────────────────
    Stack: shadcnComponentDefinitions.Stack,
    Card: shadcnComponentDefinitions.Card,
    Grid: shadcnComponentDefinitions.Grid,
    Heading: shadcnComponentDefinitions.Heading,
    Separator: shadcnComponentDefinitions.Separator,
    Accordion: shadcnComponentDefinitions.Accordion,
    Progress: shadcnComponentDefinitions.Progress,
    Skeleton: shadcnComponentDefinitions.Skeleton,
    Badge: shadcnComponentDefinitions.Badge,
    Alert: shadcnComponentDefinitions.Alert,

    // ── Text ──────────────────────────────────────────────────────────────
    Text: {
      props: z.object({
        content: z.string(),
        muted: z.boolean().nullable(),
      }),
      description: "Plain text content block",
      example: { content: "The product supports up to 1000W output." },
    },

    // ── Data display ──────────────────────────────────────────────────────
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string().nullable(),
        trend: z.enum(["up", "down", "neutral"]).nullable(),
      }),
      description:
        "Single metric display — use for chunk counts, similarity scores, document totals",
      example: { label: "Top Similarity", value: "0.91", detail: "out of 32 chunks" },
    },

    Table: {
      props: z.object({
        data: z.array(z.record(z.string(), z.unknown())),
        columns: z.array(
          z.object({ key: z.string(), label: z.string() }),
        ),
        emptyMessage: z.string().nullable(),
      }),
      description:
        'Data table. Use { "$state": "/path" } to bind data from state. ' +
        "Use for listing retrieved documents, search results, or product specs.",
      example: {
        data: { $state: "/sources" },
        columns: [
          { key: "doc", label: "Document" },
          { key: "score", label: "Relevance" },
          { key: "preview", label: "Preview" },
        ],
      },
    },

    Link: {
      props: z.object({
        text: z.string(),
        href: z.string(),
      }),
      description:
        "External link — use for document download URLs, image URLs, video URLs from retrieved chunks",
      example: { text: "Download Datasheet", href: "https://example.com/doc.pdf" },
    },

    // ── Rich content ──────────────────────────────────────────────────────
    Callout: {
      props: z.object({
        type: z.enum(["info", "tip", "warning", "important"]).nullable(),
        title: z.string().nullable(),
        content: z.string(),
      }),
      description:
        "Highlighted callout — use 'warning' when no results found, 'info' for key facts, 'tip' for recommendations",
      example: {
        type: "warning",
        title: "No results found",
        content: "No chunks matched your query. Try rephrasing or removing the model filter.",
      },
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
        "Vertical timeline — use for retrieval steps, process flows, or historical specs",
      example: {
        items: [
          { title: "Query RAGFlow", description: "Retrieved 32 chunks", date: null, status: "completed" },
          { title: "Filter by model", description: "12 chunks matched G10", date: null, status: "completed" },
          { title: "Answer generated", description: "Confidence: high", date: null, status: "current" },
        ],
      },
    },

    // ── Tabbed views ──────────────────────────────────────────────────────
    Tabs: {
      props: z.object({
        defaultValue: z.string().nullable(),
        tabs: z.array(z.object({ value: z.string(), label: z.string() })),
      }),
      slots: ["default"],
      description:
        "Tabbed container — use when results span multiple KB types (QA, Images, Files, Videos)",
    },

    TabContent: {
      props: z.object({ value: z.string() }),
      slots: ["default"],
      description: "Content panel for a specific tab",
    },

    // ── Interactive ───────────────────────────────────────────────────────
    Button: {
      props: z.object({
        label: z.string(),
        variant: z
          .enum(["default", "secondary", "destructive", "outline", "ghost"])
          .nullable(),
        size: z.enum(["default", "sm", "lg"]).nullable(),
        disabled: z.boolean().nullable(),
      }),
      description: "Clickable button — use with on.press and setState actions",
      example: { label: "Load More", variant: "outline", size: "sm", disabled: null },
    },
  },

  actions: {},
});
