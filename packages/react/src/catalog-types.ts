import type { ReactNode } from "react";
import type {
  Catalog,
  InferCatalogComponents,
  InferCatalogActions,
  InferComponentProps,
  InferActionParams,
} from "@json-render/core";

// =============================================================================
// Data Types
// =============================================================================

/**
 * Data setter function for updating application state
 */
export type SetData = (
  updater: (prev: Record<string, unknown>) => Record<string, unknown>,
) => void;

/**
 * Data model type (generic record)
 */
export type DataModel = Record<string, unknown>;

// =============================================================================
// Component Types
// =============================================================================

/**
 * Action trigger for component callbacks
 */
export interface ActionTrigger {
  name: string;
  params?: Record<string, unknown>;
}

/**
 * Context passed to component render functions
 * @example
 * const Button: ComponentFn<typeof catalog, 'Button'> = (ctx) => {
 *   return <button onClick={() => ctx.onAction?.({ name: ctx.props.action })}>{ctx.props.label}</button>
 * }
 */
export interface ComponentContext<
  C extends Catalog,
  K extends keyof InferCatalogComponents<C>,
> {
  props: InferComponentProps<C, K>;
  children?: ReactNode;
  onAction?: (action: ActionTrigger) => void;
  loading?: boolean;
}

/**
 * Component render function type for React
 * @example
 * const Button: ComponentFn<typeof catalog, 'Button'> = ({ props, onAction }) => (
 *   <button onClick={() => onAction?.({ name: props.action })}>{props.label}</button>
 * );
 */
export type ComponentFn<
  C extends Catalog,
  K extends keyof InferCatalogComponents<C>,
> = (ctx: ComponentContext<C, K>) => ReactNode;

/**
 * Registry of all component render functions for a catalog
 * @example
 * const components: Components<typeof myCatalog> = {
 *   Button: ({ props }) => <button>{props.label}</button>,
 *   Input: ({ props }) => <input placeholder={props.placeholder} />,
 * };
 */
export type Components<C extends Catalog> = {
  [K in keyof InferCatalogComponents<C>]: ComponentFn<C, K>;
};

// =============================================================================
// Action Types
// =============================================================================

/**
 * Action handler function type
 * @example
 * const viewCustomers: ActionFn<typeof catalog, 'viewCustomers'> = async (params, setData) => {
 *   const data = await fetch('/api/customers');
 *   setData(prev => ({ ...prev, customers: data }));
 * };
 */
export type ActionFn<
  C extends Catalog,
  K extends keyof InferCatalogActions<C>,
> = (
  params: InferActionParams<C, K> | undefined,
  setData: SetData,
  data: DataModel,
) => Promise<void>;

/**
 * Registry of all action handlers for a catalog
 * @example
 * const actions: Actions<typeof myCatalog> = {
 *   viewCustomers: async (params, setData) => { ... },
 *   createCustomer: async (params, setData) => { ... },
 * };
 */
export type Actions<C extends Catalog> = {
  [K in keyof InferCatalogActions<C>]: ActionFn<C, K>;
};
