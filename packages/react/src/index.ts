// Contexts
export {
  DataProvider,
  useData,
  useDataValue,
  useDataBinding,
  type DataContextValue,
  type DataProviderProps,
} from "./contexts/data";

export {
  VisibilityProvider,
  useVisibility,
  useIsVisible,
  type VisibilityContextValue,
  type VisibilityProviderProps,
} from "./contexts/visibility";

export {
  ActionProvider,
  useActions,
  useAction,
  ConfirmDialog,
  type ActionContextValue,
  type ActionProviderProps,
  type PendingConfirmation,
  type ConfirmDialogProps,
} from "./contexts/actions";

export {
  ValidationProvider,
  useValidation,
  useFieldValidation,
  type ValidationContextValue,
  type ValidationProviderProps,
  type FieldValidationState,
} from "./contexts/validation";

// Schema (React's spec format)
export {
  schema,
  type ReactSchema,
  type ReactSpec,
  // Backward compatibility
  elementTreeSchema,
  type ElementTreeSchema,
  type ElementTreeSpec,
} from "./schema";

// Core types (re-exported for convenience)
export type { Spec } from "@json-render/core";

// Catalog-aware types for React
export type {
  SetData,
  DataModel,
  ActionTrigger,
  ComponentContext,
  ComponentFn,
  Components,
  ActionFn,
  Actions,
} from "./catalog-types";

// Renderer
export {
  // New API
  createRenderer,
  type CreateRendererProps,
  type ComponentMap,
  // Legacy API
  Renderer,
  JSONUIProvider,
  createRendererFromCatalog,
  type ComponentRenderProps,
  type ComponentRenderer,
  type ComponentRegistry,
  type RendererProps,
  type JSONUIProviderProps,
} from "./renderer";

// Hooks
export {
  useUIStream,
  flatToTree,
  type UseUIStreamOptions,
  type UseUIStreamReturn,
} from "./hooks";
