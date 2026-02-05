import { defineSchema } from "@json-render/core";

/**
 * The schema for @json-render/react
 *
 * Defines:
 * - Spec: A flat tree of elements with keys, types, props, and children references
 * - Catalog: Components with props schemas, and optional actions
 */
export const schema = defineSchema((s) => ({
  // What the AI-generated SPEC looks like
  spec: s.object({
    /** Root element key */
    root: s.string(),
    /** Flat map of elements by key */
    elements: s.record(
      s.object({
        /** Unique key for this element */
        key: s.string(),
        /** Component type from catalog */
        type: s.ref("catalog.components"),
        /** Component props */
        props: s.propsOf("catalog.components"),
        /** Child element keys (flat reference) */
        children: s.array(s.string()),
        /** Parent element key (null for root) */
        parentKey: s.string(),
        /** Visibility condition */
        visible: s.any(),
      }),
    ),
  }),

  // What the CATALOG must provide
  catalog: s.object({
    /** Component definitions */
    components: s.map({
      /** Zod schema for component props */
      props: s.zod(),
      /** Slots for this component. Use ['default'] for children, or named slots like ['header', 'footer'] */
      slots: s.array(s.string()),
      /** Description for AI generation hints */
      description: s.string(),
    }),
    /** Action definitions (optional) */
    actions: s.map({
      /** Zod schema for action params */
      params: s.zod(),
      /** Description for AI generation hints */
      description: s.string(),
    }),
  }),
}));

/**
 * Type for the React schema
 */
export type ReactSchema = typeof schema;

/**
 * Infer the spec type from a catalog
 */
export type ReactSpec<TCatalog> = typeof schema extends {
  createCatalog: (catalog: TCatalog) => { _specType: infer S };
}
  ? S
  : never;

// Backward compatibility aliases
/** @deprecated Use `schema` instead */
export const elementTreeSchema = schema;
/** @deprecated Use `ReactSchema` instead */
export type ElementTreeSchema = ReactSchema;
/** @deprecated Use `ReactSpec` instead */
export type ElementTreeSpec<T> = ReactSpec<T>;
