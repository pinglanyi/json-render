"use client";

import { useState } from "react";
import { useBoundProp, defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Lightbulb,
  AlertTriangle,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { ragCatalog } from "./catalog";

export const { registry, handlers } = defineRegistry(ragCatalog, {
  components: {
    // ── Shadcn components ────────────────────────────────────────────────
    Stack: shadcnComponents.Stack,
    Card: shadcnComponents.Card,
    Grid: shadcnComponents.Grid,
    Heading: shadcnComponents.Heading,
    Separator: shadcnComponents.Separator,
    Accordion: shadcnComponents.Accordion,
    Progress: shadcnComponents.Progress,
    Skeleton: shadcnComponents.Skeleton,
    Badge: shadcnComponents.Badge,
    Alert: shadcnComponents.Alert,

    // ── Text ─────────────────────────────────────────────────────────────
    Text: ({ props }) => (
      <p className={props.muted ? "text-muted-foreground text-sm" : "text-sm"}>
        {props.content}
      </p>
    ),

    // ── Metric ───────────────────────────────────────────────────────────
    Metric: ({ props }) => {
      const TrendIcon =
        props.trend === "up"
          ? TrendingUp
          : props.trend === "down"
            ? TrendingDown
            : Minus;
      const trendColor =
        props.trend === "up"
          ? "text-green-500"
          : props.trend === "down"
            ? "text-red-500"
            : "text-muted-foreground";
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{props.label}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{props.value}</span>
            {props.trend && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
          </div>
          {props.detail && (
            <p className="text-xs text-muted-foreground">{props.detail}</p>
          )}
        </div>
      );
    },

    // ── Table ─────────────────────────────────────────────────────────────
    Table: ({ props }) => {
      const rawData = props.data;
      const items: Array<Record<string, unknown>> = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as Record<string, unknown>)?.data)
          ? ((rawData as Record<string, unknown>).data as Array<Record<string, unknown>>)
          : [];

      const [sortKey, setSortKey] = useState<string | null>(null);
      const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

      if (items.length === 0) {
        return (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {props.emptyMessage ?? "No data"}
          </div>
        );
      }

      const sorted = sortKey
        ? [...items].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (typeof av === "number" && typeof bv === "number") {
              return sortDir === "asc" ? av - bv : bv - av;
            }
            const as = String(av ?? "");
            const bs = String(bv ?? "");
            return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
          })
        : items;

      const handleSort = (key: string) => {
        if (sortKey === key) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setSortKey(key);
          setSortDir("asc");
        }
      };

      return (
        <Table>
          <TableHeader>
            <TableRow>
              {props.columns.map((col) => {
                const SortIcon =
                  sortKey === col.key
                    ? sortDir === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown;
                return (
                  <TableHead key={col.key}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item, i) => (
              <TableRow key={i}>
                {props.columns.map((col) => (
                  <TableCell key={col.key}>{String(item[col.key] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    },

    // ── Link ──────────────────────────────────────────────────────────────
    Link: ({ props }) => (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4 hover:text-primary/80 text-sm"
      >
        {props.text}
      </a>
    ),

    // ── Callout ───────────────────────────────────────────────────────────
    Callout: ({ props }) => {
      const config = {
        info: {
          icon: Info,
          border: "border-l-blue-500",
          bg: "bg-blue-500/5",
          iconColor: "text-blue-500",
        },
        tip: {
          icon: Lightbulb,
          border: "border-l-emerald-500",
          bg: "bg-emerald-500/5",
          iconColor: "text-emerald-500",
        },
        warning: {
          icon: AlertTriangle,
          border: "border-l-amber-500",
          bg: "bg-amber-500/5",
          iconColor: "text-amber-500",
        },
        important: {
          icon: Star,
          border: "border-l-purple-500",
          bg: "bg-purple-500/5",
          iconColor: "text-purple-500",
        },
      }[props.type ?? "info"] ?? {
        icon: Info,
        border: "border-l-blue-500",
        bg: "bg-blue-500/5",
        iconColor: "text-blue-500",
      };
      const Icon = config.icon;
      return (
        <div className={`border-l-4 ${config.border} ${config.bg} rounded-r-lg p-4`}>
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
              {props.title && (
                <p className="font-semibold text-sm mb-1">{props.title}</p>
              )}
              <p className="text-sm text-muted-foreground">{props.content}</p>
            </div>
          </div>
        </div>
      );
    },

    // ── Timeline ──────────────────────────────────────────────────────────
    Timeline: ({ props }) => (
      <div className="relative pl-8">
        <div className="absolute left-[5.5px] top-3 bottom-3 w-px bg-border" />
        <div className="flex flex-col gap-6">
          {(props.items ?? []).map((item, i) => {
            const dotColor =
              item.status === "completed"
                ? "bg-emerald-500"
                : item.status === "current"
                  ? "bg-blue-500"
                  : "bg-muted-foreground/30";
            return (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-8 top-0.5 h-3 w-3 rounded-full ${dotColor} ring-2 ring-background`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.date && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {item.date}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),

    // ── Tabs ──────────────────────────────────────────────────────────────
    Tabs: ({ props, children }) => (
      <Tabs defaultValue={props.defaultValue ?? (props.tabs ?? [])[0]?.value}>
        <TabsList>
          {(props.tabs ?? []).map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    ),

    TabContent: ({ props, children }) => (
      <TabsContent value={props.value}>{children}</TabsContent>
    ),

    // ── Button ────────────────────────────────────────────────────────────
    Button: ({ props, emit }) => (
      <Button
        variant={props.variant ?? "default"}
        size={props.size ?? "default"}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
      >
        {props.label}
      </Button>
    ),
  },
});

// ── Fallback ──────────────────────────────────────────────────────────────────

export function Fallback({ type }: { type: string }) {
  return (
    <div className="p-4 border border-dashed rounded-lg text-muted-foreground text-sm">
      Unknown component: {type}
    </div>
  );
}
