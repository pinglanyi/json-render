"use client";

import { useMemo, type ReactNode } from "react";
import {
  Renderer,
  type ComponentRegistry,
  type Spec,
  DataProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";

import { components, Fallback } from "./catalog/components";
import { executeAction } from "./catalog/actions";

// =============================================================================
// PlaygroundRenderer
// =============================================================================

interface PlaygroundRendererProps {
  spec: Spec | null;
  data?: Record<string, unknown>;
  loading?: boolean;
}

// Build registry once - stable reference to prevent input focus loss
function buildRegistry(loading?: boolean): ComponentRegistry {
  const registry: ComponentRegistry = {};

  for (const [name, Component] of Object.entries(components)) {
    registry[name] = (renderProps: {
      element: { props: Record<string, unknown>; type: string };
      children?: ReactNode;
    }) => (
      <Component
        props={renderProps.element.props as never}
        onAction={(a) => executeAction(a.name, a.params)}
        loading={loading}
      >
        {renderProps.children}
      </Component>
    );
  }

  return registry;
}

// Fallback component for unknown types
const fallbackRegistry = (renderProps: { element: { type: string } }) => (
  <Fallback type={renderProps.element.type} />
);

export function PlaygroundRenderer({
  spec,
  data,
  loading,
}: PlaygroundRendererProps): ReactNode {
  // Memoize registry to prevent re-creating on every render
  const registry = useMemo(() => buildRegistry(loading), [loading]);

  if (!spec) return null;

  return (
    <DataProvider initialData={data}>
      <VisibilityProvider>
        <ActionProvider>
          <Renderer
            spec={spec}
            registry={registry}
            fallback={fallbackRegistry}
            loading={loading}
          />
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}
