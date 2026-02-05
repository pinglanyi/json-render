"use client";

import { useMemo, useRef, type ReactNode } from "react";
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
// DashboardRenderer
// =============================================================================

type SetData = (
  updater: (prev: Record<string, unknown>) => Record<string, unknown>,
) => void;

interface DashboardRendererProps {
  spec: Spec | null;
  data?: Record<string, unknown>;
  setData?: SetData;
  onDataChange?: (path: string, value: unknown) => void;
  loading?: boolean;
}

// Build registry - uses refs to avoid recreating on data changes
function buildRegistry(
  dataRef: React.RefObject<Record<string, unknown>>,
  setDataRef: React.RefObject<SetData | undefined>,
  loading?: boolean,
): ComponentRegistry {
  const registry: ComponentRegistry = {};

  for (const [name, componentFn] of Object.entries(components)) {
    registry[name] = (renderProps: {
      element: { props: Record<string, unknown> };
      children?: ReactNode;
    }) =>
      componentFn({
        props: renderProps.element.props as never,
        children: renderProps.children,
        onAction: (a) => {
          const setData = setDataRef.current;
          const data = dataRef.current;
          if (setData) {
            executeAction(a.name, a.params, setData, data);
          }
        },
        loading,
      });
  }

  return registry;
}

// Fallback component for unknown types
const fallbackRegistry = (renderProps: { element: { type: string } }) => (
  <Fallback type={renderProps.element.type} />
);

export function DashboardRenderer({
  spec,
  data = {},
  setData,
  onDataChange,
  loading,
}: DashboardRendererProps): ReactNode {
  // Use refs to keep registry stable while still accessing latest data/setData
  const dataRef = useRef(data);
  const setDataRef = useRef(setData);
  dataRef.current = data;
  setDataRef.current = setData;

  // Memoize registry - only changes when loading changes
  const registry = useMemo(
    () => buildRegistry(dataRef, setDataRef, loading),
    [loading],
  );

  if (!spec) return null;

  return (
    <DataProvider initialData={data} onDataChange={onDataChange}>
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
