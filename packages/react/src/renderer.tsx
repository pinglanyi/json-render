"use client";

import React, { type ComponentType, type ReactNode, useMemo } from "react";
import type {
  UIElement,
  Spec,
  Action,
  Catalog as NewCatalog,
  SchemaDefinition,
  LegacyCatalog,
  ComponentDefinition,
} from "@json-render/core";
import { useIsVisible } from "./contexts/visibility";
import { useActions } from "./contexts/actions";
import { useData } from "./contexts/data";
import { DataProvider } from "./contexts/data";
import { VisibilityProvider } from "./contexts/visibility";
import { ActionProvider } from "./contexts/actions";
import { ValidationProvider } from "./contexts/validation";
import { ConfirmDialog } from "./contexts/actions";

/**
 * Props passed to component renderers
 */
export interface ComponentRenderProps<P = Record<string, unknown>> {
  /** The element being rendered */
  element: UIElement<string, P>;
  /** Rendered children */
  children?: ReactNode;
  /** Execute an action */
  onAction?: (action: Action) => void;
  /** Whether the parent is loading */
  loading?: boolean;
}

/**
 * Component renderer type
 */
export type ComponentRenderer<P = Record<string, unknown>> = ComponentType<
  ComponentRenderProps<P>
>;

/**
 * Registry of component renderers
 */
export type ComponentRegistry = Record<string, ComponentRenderer<any>>;

/**
 * Props for the Renderer component
 */
export interface RendererProps {
  /** The UI spec to render */
  spec: Spec | null;
  /** Component registry */
  registry: ComponentRegistry;
  /** Whether the spec is currently loading/streaming */
  loading?: boolean;
  /** Fallback component for unknown types */
  fallback?: ComponentRenderer;
}

/**
 * Element renderer component
 */
function ElementRenderer({
  element,
  spec,
  registry,
  loading,
  fallback,
}: {
  element: UIElement;
  spec: Spec;
  registry: ComponentRegistry;
  loading?: boolean;
  fallback?: ComponentRenderer;
}) {
  const isVisible = useIsVisible(element.visible);
  const { execute } = useActions();

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Get the component renderer
  const Component = registry[element.type] ?? fallback;

  if (!Component) {
    console.warn(`No renderer for component type: ${element.type}`);
    return null;
  }

  // Render children
  const children = element.children?.map((childKey) => {
    const childElement = spec.elements[childKey];
    if (!childElement) {
      return null;
    }
    return (
      <ElementRenderer
        key={childKey}
        element={childElement}
        spec={spec}
        registry={registry}
        loading={loading}
        fallback={fallback}
      />
    );
  });

  return (
    <Component element={element} onAction={execute} loading={loading}>
      {children}
    </Component>
  );
}

/**
 * Main renderer component
 */
export function Renderer({ spec, registry, loading, fallback }: RendererProps) {
  if (!spec || !spec.root) {
    return null;
  }

  const rootElement = spec.elements[spec.root];
  if (!rootElement) {
    return null;
  }

  return (
    <ElementRenderer
      element={rootElement}
      spec={spec}
      registry={registry}
      loading={loading}
      fallback={fallback}
    />
  );
}

/**
 * Props for JSONUIProvider
 */
export interface JSONUIProviderProps {
  /** Component registry */
  registry: ComponentRegistry;
  /** Initial data model */
  initialData?: Record<string, unknown>;
  /** Auth state */
  authState?: { isSignedIn: boolean; user?: Record<string, unknown> };
  /** Action handlers */
  actionHandlers?: Record<
    string,
    (params: Record<string, unknown>) => Promise<unknown> | unknown
  >;
  /** Navigation function */
  navigate?: (path: string) => void;
  /** Custom validation functions */
  validationFunctions?: Record<
    string,
    (value: unknown, args?: Record<string, unknown>) => boolean
  >;
  /** Callback when data changes */
  onDataChange?: (path: string, value: unknown) => void;
  children: ReactNode;
}

/**
 * Combined provider for all JSONUI contexts
 */
export function JSONUIProvider({
  registry,
  initialData,
  authState,
  actionHandlers,
  navigate,
  validationFunctions,
  onDataChange,
  children,
}: JSONUIProviderProps) {
  return (
    <DataProvider
      initialData={initialData}
      authState={authState}
      onDataChange={onDataChange}
    >
      <VisibilityProvider>
        <ActionProvider handlers={actionHandlers} navigate={navigate}>
          <ValidationProvider customFunctions={validationFunctions}>
            {children}
            <ConfirmationDialogManager />
          </ValidationProvider>
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}

/**
 * Renders the confirmation dialog when needed
 */
function ConfirmationDialogManager() {
  const { pendingConfirmation, confirm, cancel } = useActions();

  if (!pendingConfirmation?.action.confirm) {
    return null;
  }

  return (
    <ConfirmDialog
      confirm={pendingConfirmation.action.confirm}
      onConfirm={confirm}
      onCancel={cancel}
    />
  );
}

/**
 * Legacy helper to create a renderer component from a catalog
 * @deprecated Use createRenderer with the new catalog API instead
 */
export function createRendererFromCatalog<
  C extends LegacyCatalog<Record<string, ComponentDefinition>>,
>(
  _catalog: C,
  registry: ComponentRegistry,
): ComponentType<Omit<RendererProps, "registry">> {
  return function CatalogRenderer(props: Omit<RendererProps, "registry">) {
    return <Renderer {...props} registry={registry} />;
  };
}

// ============================================================================
// NEW API
// ============================================================================

/**
 * Props for renderers created with createRenderer
 */
export interface CreateRendererProps {
  /** The spec to render (AI-generated JSON) */
  spec: Spec | null;
  /** Data context for dynamic values */
  data?: Record<string, unknown>;
  /** Action handler */
  onAction?: (actionName: string, params?: Record<string, unknown>) => void;
  /** Callback when data changes (e.g., from form inputs) */
  onDataChange?: (path: string, value: unknown) => void;
  /** Whether the spec is currently loading/streaming */
  loading?: boolean;
  /** Auth state for visibility conditions */
  authState?: { isSignedIn: boolean; user?: Record<string, unknown> };
  /** Fallback component for unknown types */
  fallback?: ComponentRenderer;
}

/**
 * Component map type - maps component names to React components
 */
export type ComponentMap<
  TComponents extends Record<string, { props: unknown }>,
> = {
  [K in keyof TComponents]: ComponentType<
    ComponentRenderProps<
      TComponents[K]["props"] extends { _output: infer O }
        ? O
        : Record<string, unknown>
    >
  >;
};

/**
 * Create a renderer from a catalog
 *
 * @example
 * ```typescript
 * const DashboardRenderer = createRenderer(dashboardCatalog, {
 *   Card: ({ element, children }) => <div className="card">{children}</div>,
 *   Metric: ({ element }) => <span>{element.props.value}</span>,
 * });
 *
 * // Usage
 * <DashboardRenderer spec={aiGeneratedSpec} data={data} />
 * ```
 */
export function createRenderer<
  TDef extends SchemaDefinition,
  TCatalog extends { components: Record<string, { props: unknown }> },
>(
  catalog: NewCatalog<TDef, TCatalog>,
  components: ComponentMap<TCatalog["components"]>,
): ComponentType<CreateRendererProps> {
  // Convert component map to registry
  const registry: ComponentRegistry =
    components as unknown as ComponentRegistry;

  // Return the renderer component
  return function CatalogRenderer({
    spec,
    data,
    onAction,
    onDataChange,
    loading,
    authState,
    fallback,
  }: CreateRendererProps) {
    // Wrap onAction to match internal API
    const actionHandlers = onAction
      ? {
          __default__: (params: Record<string, unknown>) => {
            const actionName = params.__actionName__ as string;
            const actionParams = params.__actionParams__ as Record<
              string,
              unknown
            >;
            return onAction(actionName, actionParams);
          },
        }
      : undefined;

    return (
      <DataProvider
        initialData={data}
        authState={authState}
        onDataChange={onDataChange}
      >
        <VisibilityProvider>
          <ActionProvider handlers={actionHandlers}>
            <ValidationProvider>
              <Renderer
                spec={spec}
                registry={registry}
                loading={loading}
                fallback={fallback}
              />
              <ConfirmationDialogManager />
            </ValidationProvider>
          </ActionProvider>
        </VisibilityProvider>
      </DataProvider>
    );
  };
}
