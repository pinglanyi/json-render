"use client";

import { useState, type ReactNode } from "react";
import type { z } from "zod";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { playgroundCatalog } from "../catalog";

// =============================================================================
// Types - Inferred from Catalog
// =============================================================================

type CatalogComponents = typeof playgroundCatalog.data.components;

export type InferProps<K extends keyof CatalogComponents> =
  CatalogComponents[K] extends { props: z.ZodType<infer P> } ? P : never;

export interface ComponentContext<K extends keyof CatalogComponents> {
  props: InferProps<K>;
  children?: ReactNode;
  onAction?: (action: {
    name: string;
    params?: Record<string, unknown>;
  }) => void;
  loading?: boolean;
}

export type ComponentFn<K extends keyof CatalogComponents> = (
  ctx: ComponentContext<K>,
) => ReactNode;

// =============================================================================
// Components - Type-safe with Catalog using shadcn/ui
// =============================================================================

export const components: { [K in keyof CatalogComponents]: ComponentFn<K> } = {
  // Layout Components
  Card: ({ props, children }) => {
    const maxWidthClass =
      props.maxWidth === "sm"
        ? "max-w-xs sm:min-w-[280px]"
        : props.maxWidth === "md"
          ? "max-w-sm sm:min-w-[320px]"
          : props.maxWidth === "lg"
            ? "max-w-md sm:min-w-[360px]"
            : "w-full";
    const centeredClass = props.centered ? "mx-auto" : "";

    return (
      <div
        className={`border border-border rounded-lg p-4 bg-card text-card-foreground overflow-hidden ${maxWidthClass} ${centeredClass}`}
      >
        {props.title && (
          <div className="font-semibold text-sm mb-1 text-left">
            {props.title}
          </div>
        )}
        {props.description && (
          <div className="text-xs text-muted-foreground mb-3 text-left">
            {props.description}
          </div>
        )}
        <div className="space-y-3">{children}</div>
      </div>
    );
  },

  Stack: ({ props, children }) => {
    const isHorizontal = props.direction === "horizontal";

    const gapClass =
      props.gap === "lg"
        ? "gap-4"
        : props.gap === "md"
          ? "gap-3"
          : props.gap === "sm"
            ? "gap-2"
            : props.gap === "none"
              ? "gap-0"
              : "gap-3";

    const alignClass =
      props.align === "center"
        ? "items-center"
        : props.align === "end"
          ? "items-end"
          : props.align === "stretch"
            ? "items-stretch"
            : "items-start";

    const justifyClass =
      props.justify === "center"
        ? "justify-center"
        : props.justify === "end"
          ? "justify-end"
          : props.justify === "between"
            ? "justify-between"
            : props.justify === "around"
              ? "justify-around"
              : "";

    return (
      <div
        className={`flex ${isHorizontal ? "flex-row flex-wrap" : "flex-col"} ${gapClass} ${alignClass} ${justifyClass}`}
      >
        {children}
      </div>
    );
  },

  Grid: ({ props, children }) => {
    const cols =
      props.columns === 6
        ? "grid-cols-6"
        : props.columns === 5
          ? "grid-cols-5"
          : props.columns === 4
            ? "grid-cols-4"
            : props.columns === 3
              ? "grid-cols-3"
              : props.columns === 2
                ? "grid-cols-2"
                : "grid-cols-1";
    const gridGap =
      props.gap === "lg" ? "gap-4" : props.gap === "sm" ? "gap-2" : "gap-3";

    return <div className={`grid ${cols} ${gridGap}`}>{children}</div>;
  },

  Divider: () => <Separator className="my-3" />,

  // Form Inputs
  Input: ({ props }) => (
    <div className="space-y-2">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        id={props.name}
        name={props.name}
        type={props.type ?? "text"}
        placeholder={props.placeholder ?? ""}
      />
    </div>
  ),

  Textarea: ({ props }) => (
    <div className="space-y-2">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Textarea
        id={props.name}
        name={props.name}
        placeholder={props.placeholder ?? ""}
        rows={props.rows ?? 3}
      />
    </div>
  ),

  Select: ({ props }) => {
    const [value, setValue] = useState<string>("");

    return (
      <div className="space-y-2">
        <Label>{props.label}</Label>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={props.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },

  Checkbox: ({ props }) => {
    const [checked, setChecked] = useState(!!props.checked);

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={props.name}
          checked={checked}
          onCheckedChange={(c) => setChecked(c === true)}
        />
        <Label htmlFor={props.name} className="cursor-pointer">
          {props.label}
        </Label>
      </div>
    );
  },

  Radio: ({ props }) => {
    const [value, setValue] = useState(props.options[0] ?? "");

    return (
      <div className="space-y-2">
        {props.label && <Label>{props.label}</Label>}
        <RadioGroup value={value} onValueChange={setValue}>
          {props.options.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={opt} id={`${props.name}-${opt}`} />
              <Label
                htmlFor={`${props.name}-${opt}`}
                className="cursor-pointer"
              >
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  },

  Switch: ({ props }) => {
    const [checked, setChecked] = useState(!!props.checked);

    return (
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor={props.name} className="cursor-pointer">
          {props.label}
        </Label>
        <Switch
          id={props.name}
          checked={checked}
          onCheckedChange={setChecked}
        />
      </div>
    );
  },

  // Actions
  Button: ({ props, onAction, loading }) => {
    const variant =
      props.variant === "danger"
        ? "destructive"
        : props.variant === "secondary"
          ? "secondary"
          : "default";

    return (
      <Button
        variant={variant}
        disabled={loading}
        onClick={() =>
          onAction?.({
            name: props.action ?? "buttonClick",
            params: props.actionParams ?? { message: props.label },
          })
        }
      >
        {loading ? "..." : props.label}
      </Button>
    );
  },

  Link: ({ props, onAction }) => (
    <Button
      variant="link"
      className="h-auto p-0"
      onClick={() =>
        onAction?.({
          name: "linkClick",
          params: { href: props.href },
        })
      }
    >
      {props.label}
    </Button>
  ),

  // Typography
  Heading: ({ props }) => {
    const level = props.level ?? "h2";
    const headingClass =
      level === "h1"
        ? "text-2xl font-bold"
        : level === "h3"
          ? "text-base font-semibold"
          : level === "h4"
            ? "text-sm font-semibold"
            : "text-lg font-semibold";

    if (level === "h1")
      return <h1 className={`${headingClass} text-left`}>{props.text}</h1>;
    if (level === "h3")
      return <h3 className={`${headingClass} text-left`}>{props.text}</h3>;
    if (level === "h4")
      return <h4 className={`${headingClass} text-left`}>{props.text}</h4>;
    return <h2 className={`${headingClass} text-left`}>{props.text}</h2>;
  },

  Text: ({ props }) => {
    const textClass =
      props.variant === "caption"
        ? "text-xs"
        : props.variant === "muted"
          ? "text-sm text-muted-foreground"
          : "text-sm";

    return <p className={`${textClass} text-left`}>{props.text}</p>;
  },

  // Data Display
  Image: ({ props }) => {
    const imgStyle = {
      width: props.width ?? 80,
      height: props.height ?? 60,
    };

    return (
      <div
        className="bg-muted border border-border rounded flex items-center justify-center text-xs text-muted-foreground aspect-video"
        style={imgStyle}
      >
        {props.alt || "img"}
      </div>
    );
  },

  Avatar: ({ props }) => {
    const name = props.name || "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const avatarSize =
      props.size === "lg"
        ? "w-12 h-12 text-base"
        : props.size === "sm"
          ? "w-8 h-8 text-xs"
          : "w-10 h-10 text-sm";

    return (
      <div
        className={`${avatarSize} rounded-full bg-muted flex items-center justify-center font-medium`}
      >
        {initials}
      </div>
    );
  },

  Badge: ({ props }) => {
    const variant =
      props.variant === "success" || props.variant === "warning"
        ? "secondary"
        : props.variant === "danger"
          ? "destructive"
          : "default";

    // Add custom colors for success/warning
    const customClass =
      props.variant === "success"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : props.variant === "warning"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          : "";

    return (
      <Badge variant={variant} className={customClass}>
        {props.text}
      </Badge>
    );
  },

  Alert: ({ props }) => {
    const variant = props.type === "error" ? "destructive" : "default";

    // Custom colors for different alert types
    const customClass =
      props.type === "success"
        ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
        : props.type === "warning"
          ? "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
          : props.type === "info"
            ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
            : "";

    return (
      <Alert variant={variant} className={customClass}>
        <AlertTitle>{props.title}</AlertTitle>
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
      </Alert>
    );
  },

  Progress: ({ props }) => {
    const value = Math.min(100, Math.max(0, props.value || 0));

    return (
      <div className="space-y-2">
        {props.label && (
          <Label className="text-sm text-muted-foreground">{props.label}</Label>
        )}
        <Progress value={value} />
      </div>
    );
  },

  Rating: ({ props }) => {
    const ratingValue = props.value || 0;
    const maxRating = props.max ?? 5;

    return (
      <div className="space-y-2">
        {props.label && (
          <Label className="text-sm text-muted-foreground">{props.label}</Label>
        )}
        <div className="flex gap-1">
          {Array.from({ length: maxRating }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < ratingValue ? "text-yellow-400" : "text-muted"}`}
            >
              *
            </span>
          ))}
        </div>
      </div>
    );
  },

  // Charts
  BarGraph: ({ props }) => {
    const data = props.data || [];
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
      <div className="space-y-2">
        {props.title && (
          <div className="text-sm font-medium text-left">{props.title}</div>
        )}
        <div className="flex gap-2">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-muted-foreground">{d.value}</div>
              <div className="w-full h-24 flex items-end">
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{
                    height: `${(d.value / maxValue) * 100}%`,
                    minHeight: 2,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground truncate w-full text-center">
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },

  LineGraph: ({ props }) => {
    const data = props.data || [];
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const width = 300;
    const height = 100;
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x =
        padding.left +
        (data.length > 1
          ? (i / (data.length - 1)) * chartWidth
          : chartWidth / 2);
      const y =
        padding.top +
        chartHeight -
        ((d.value - minValue) / range) * chartHeight;
      return { x, y, ...d };
    });

    const pathD =
      points.length > 0
        ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`
        : "";

    return (
      <div className="space-y-2">
        {props.title && (
          <div className="text-sm font-medium text-left">{props.title}</div>
        )}
        <div className="relative h-28">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <line
              x1={padding.left}
              y1={padding.top + chartHeight / 2}
              x2={width - padding.right}
              y2={padding.top + chartHeight / 2}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={width - padding.right}
              y2={padding.top}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              />
            )}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-primary"
              />
            ))}
          </svg>
        </div>
        {data.length > 0 && (
          <div className="flex justify-between">
            {data.map((d, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground text-center"
                style={{ width: `${100 / data.length}%` }}
              >
                {d.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

// Fallback component for unknown types
export function Fallback({ type }: { type: string }) {
  return <div className="text-xs text-muted-foreground">[{type}]</div>;
}
