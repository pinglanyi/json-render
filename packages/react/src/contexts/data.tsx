"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  getByPath,
  setByPath,
  type DataModel,
  type AuthState,
} from "@json-render/core";

/**
 * Data context value
 */
export interface DataContextValue {
  /** The current data model */
  data: DataModel;
  /** Auth state for visibility evaluation */
  authState?: AuthState;
  /** Get a value by path */
  get: (path: string) => unknown;
  /** Set a value by path */
  set: (path: string, value: unknown) => void;
  /** Update multiple values at once */
  update: (updates: Record<string, unknown>) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Props for DataProvider
 */
export interface DataProviderProps {
  /** Initial data model */
  initialData?: DataModel;
  /** Auth state */
  authState?: AuthState;
  /** Callback when data changes */
  onDataChange?: (path: string, value: unknown) => void;
  children: ReactNode;
}

/**
 * Provider for data model context
 */
export function DataProvider({
  initialData = {},
  authState,
  onDataChange,
  children,
}: DataProviderProps) {
  const [data, setData] = useState<DataModel>(initialData);

  // Track the serialized initialData to detect actual value changes (not just reference changes)
  const initialDataJsonRef = useRef<string>(JSON.stringify(initialData));

  // Sync external data changes with internal state - only when values actually change
  useEffect(() => {
    const newJson = JSON.stringify(initialData);
    if (newJson !== initialDataJsonRef.current) {
      initialDataJsonRef.current = newJson;
      if (initialData && Object.keys(initialData).length > 0) {
        setData((prev) => ({ ...prev, ...initialData }));
      }
    }
  }, [initialData]);

  const get = useCallback((path: string) => getByPath(data, path), [data]);

  const set = useCallback(
    (path: string, value: unknown) => {
      setData((prev) => {
        const next = { ...prev };
        setByPath(next, path, value);
        return next;
      });
      onDataChange?.(path, value);
    },
    [onDataChange],
  );

  const update = useCallback(
    (updates: Record<string, unknown>) => {
      setData((prev) => {
        const next = { ...prev };
        for (const [path, value] of Object.entries(updates)) {
          setByPath(next, path, value);
          onDataChange?.(path, value);
        }
        return next;
      });
    },
    [onDataChange],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      authState,
      get,
      set,
      update,
    }),
    [data, authState, get, set, update],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/**
 * Hook to access the data context
 */
export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}

/**
 * Hook to get a value from the data model
 */
export function useDataValue<T>(path: string): T | undefined {
  const { data } = useData();
  return getByPath(data, path) as T | undefined;
}

/**
 * Hook to get and set a value from the data model (like useState)
 */
export function useDataBinding<T>(
  path: string,
): [T | undefined, (value: T) => void] {
  const { data, set } = useData();
  const value = getByPath(data, path) as T | undefined;
  const setValue = useCallback(
    (newValue: T) => set(path, newValue),
    [path, set],
  );
  return [value, setValue];
}
