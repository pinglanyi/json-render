"use client";

import { useData, type Components } from "@json-render/react";
import { getByPath } from "@json-render/core";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { dashboardCatalog } from "../catalog";

// =============================================================================
// Components - Type-safe with Catalog
// =============================================================================

export const components: Components<typeof dashboardCatalog> = {
  Stack: ({ props, children }) => {
    const gapClass =
      { sm: "gap-2", md: "gap-4", lg: "gap-6" }[props.gap ?? "md"] ?? "gap-4";
    return (
      <div
        className={`flex ${props.direction === "horizontal" ? "flex-row" : "flex-col"} ${gapClass}`}
      >
        {children}
      </div>
    );
  },

  Accordion: ({ props, children }) => (
    <Accordion type={props.type ?? "single"} collapsible>
      {children}
    </Accordion>
  ),

  AccordionItem: ({ props, children }) => (
    <AccordionItem value={props.value}>
      <AccordionTrigger>{props.title}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  ),

  Button: ({ props, onAction, loading }) => (
    <Button
      variant={props.variant ?? "default"}
      disabled={loading || (props.disabled ?? false)}
      onClick={() =>
        onAction?.({
          name: props.action,
          params: props.actionParams ?? undefined,
        })
      }
    >
      {loading ? "..." : props.label}
    </Button>
  ),

  Input: ({ props }) => {
    const { data, set } = useData();
    return (
      <div className="flex flex-col gap-2">
        {props.label ? <Label>{props.label}</Label> : null}
        <Input
          type={props.type ?? "text"}
          value={(getByPath(data, props.valuePath) as string) ?? ""}
          placeholder={props.placeholder ?? ""}
          onChange={(e) => set(props.valuePath, e.target.value)}
        />
      </div>
    );
  },

  Form: ({ props, children, onAction }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAction?.({
          name: props.submitAction,
          params: props.submitActionParams ?? undefined,
        });
      }}
      className="flex flex-col gap-4"
    >
      {children}
    </form>
  ),

  Badge: ({ props }) => (
    <Badge variant={props.variant ?? "default"}>{props.text}</Badge>
  ),

  Alert: ({ props }) => (
    <Alert variant={props.variant ?? "default"}>
      <AlertTitle>{props.title}</AlertTitle>
      {props.description ? (
        <AlertDescription>{props.description}</AlertDescription>
      ) : null}
    </Alert>
  ),

  Separator: () => <Separator />,

  Avatar: ({ props }) => (
    <Avatar>
      {props.src ? <AvatarImage src={props.src} alt={props.alt ?? ""} /> : null}
      <AvatarFallback>{props.fallback}</AvatarFallback>
    </Avatar>
  ),

  Checkbox: ({ props }) => {
    const { data, set } = useData();
    const checked =
      (getByPath(data, props.valuePath) as boolean) ??
      props.defaultChecked ??
      false;
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={props.valuePath}
          checked={checked}
          onCheckedChange={(value) => set(props.valuePath, value)}
        />
        {props.label ? (
          <Label htmlFor={props.valuePath}>{props.label}</Label>
        ) : null}
      </div>
    );
  },

  Dialog: ({ props, children }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{props.trigger}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description ? (
            <DialogDescription>{props.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  ),

  Drawer: ({ props, children }) => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">{props.trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description ? (
            <DrawerDescription>{props.description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  ),

  DropdownMenu: ({ props, onAction }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{props.trigger}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {props.items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            onClick={() =>
              item.action
                ? onAction?.({
                    name: item.action,
                    params: item.actionParams ?? undefined,
                  })
                : undefined
            }
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ),

  Label: ({ props }) => (
    <Label htmlFor={props.htmlFor ?? undefined}>{props.text}</Label>
  ),

  Pagination: ({ props }) => {
    const pages = Array.from({ length: props.totalPages }, (_, i) => i + 1);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink href="#" isActive={page === props.currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },

  Popover: ({ props, children }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{props.trigger}</Button>
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  ),

  Progress: ({ props }) => (
    <Progress value={props.value} max={props.max ?? 100} />
  ),

  RadioGroup: ({ props }) => {
    const { data, set } = useData();
    const value =
      (getByPath(data, props.valuePath) as string) ?? props.defaultValue ?? "";
    return (
      <RadioGroup value={value} onValueChange={(v) => set(props.valuePath, v)}>
        {props.options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  },

  Select: ({ props }) => {
    const { data, set } = useData();
    const value = (getByPath(data, props.valuePath) as string) ?? "";
    return (
      <Select value={value} onValueChange={(v) => set(props.valuePath, v)}>
        <SelectTrigger>
          <SelectValue placeholder={props.placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },

  Skeleton: ({ props }) => (
    <Skeleton
      className={`${props.width ?? "w-full"} ${props.height ?? "h-4"}`}
    />
  ),

  Spinner: ({ props }) => {
    const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
    const size = sizes[props.size ?? "md"];
    return (
      <div
        className={`${size} animate-spin rounded-full border-2 border-muted border-t-primary`}
      />
    );
  },

  Switch: ({ props }) => {
    const { data, set } = useData();
    const checked =
      (getByPath(data, props.valuePath) as boolean) ??
      props.defaultChecked ??
      false;
    return (
      <div className="flex items-center gap-2">
        <Switch
          id={props.valuePath}
          checked={checked}
          onCheckedChange={(value) => set(props.valuePath, value)}
        />
        {props.label ? (
          <Label htmlFor={props.valuePath}>{props.label}</Label>
        ) : null}
      </div>
    );
  },

  Tabs: ({ props, children }) => (
    <Tabs defaultValue={props.defaultValue ?? props.tabs[0]?.value}>
      <TabsList>
        {props.tabs.map((tab) => (
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

  Textarea: ({ props }) => {
    const { data, set } = useData();
    return (
      <div className="flex flex-col gap-2">
        {props.label ? <Label>{props.label}</Label> : null}
        <Textarea
          value={(getByPath(data, props.valuePath) as string) ?? ""}
          placeholder={props.placeholder ?? ""}
          rows={props.rows ?? 3}
          onChange={(e) => set(props.valuePath, e.target.value)}
        />
      </div>
    );
  },

  Tooltip: ({ props, children }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{props.content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),

  // Heading is intentionally not rendered - widgets already have a title bar
  Heading: () => null,

  Text: ({ props }) => (
    <p className={props.muted ? "text-muted-foreground" : ""}>
      {props.content}
    </p>
  ),

  Table: ({ props, onAction }) => {
    const { data } = useData();
    const path = props.dataPath.replace(/\./g, "/");
    const rawData = getByPath(data, path);

    const items: Array<Record<string, unknown>> = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as Record<string, unknown>)?.data)
        ? ((rawData as Record<string, unknown>).data as Array<
            Record<string, unknown>
          >)
        : Array.isArray((rawData as Record<string, unknown>)?.items)
          ? ((rawData as Record<string, unknown>).items as Array<
              Record<string, unknown>
            >)
          : [];

    if (items.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          {props.emptyMessage ?? "No data"}
        </div>
      );
    }

    const hasRowActions = props.rowActions && props.rowActions.length > 0;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {props.columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
            {hasRowActions ? <TableHead>Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i}>
              {props.columns.map((col) => (
                <TableCell key={col.key}>
                  {String(item[col.key] ?? "")}
                </TableCell>
              ))}
              {hasRowActions ? (
                <TableCell>
                  <div className="flex gap-1">
                    {props.rowActions!.map((rowAction) => (
                      <Button
                        key={rowAction.action}
                        variant={rowAction.variant ?? "ghost"}
                        size="sm"
                        onClick={() =>
                          onAction?.({
                            name: rowAction.action,
                            params: { id: item.id as string },
                          })
                        }
                      >
                        {rowAction.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },

  BarChart: ({ props }) => {
    const { data } = useData();
    const path = props.dataPath.replace(/\./g, "/");
    const rawData = getByPath(data, path);

    const rawItems: Array<Record<string, unknown>> = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as Record<string, unknown>)?.data)
        ? ((rawData as Record<string, unknown>).data as Array<
            Record<string, unknown>
          >)
        : [];

    // Process and aggregate data
    const { items, valueKey } = processChartData(
      rawItems,
      props.xKey,
      props.yKey,
      props.aggregate,
    );

    const chartColor = props.color ?? "var(--chart-1)";

    const chartConfig = {
      [valueKey]: {
        label: valueKey,
        color: chartColor,
      },
    } satisfies ChartConfig;

    if (items.length === 0) {
      return (
        <div className="w-full">
          <div className="text-center py-4 text-muted-foreground">
            No data available
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full"
          style={{ height: props.height ?? 300 }}
        >
          <RechartsBarChart accessibilityLayer data={items}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey={valueKey}
              fill={`var(--color-${valueKey})`}
              radius={4}
            />
          </RechartsBarChart>
        </ChartContainer>
      </div>
    );
  },

  LineChart: ({ props }) => {
    const { data } = useData();
    const path = props.dataPath.replace(/\./g, "/");
    const rawData = getByPath(data, path);

    const rawItems: Array<Record<string, unknown>> = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as Record<string, unknown>)?.data)
        ? ((rawData as Record<string, unknown>).data as Array<
            Record<string, unknown>
          >)
        : [];

    // Process and aggregate data
    const { items, valueKey } = processChartData(
      rawItems,
      props.xKey,
      props.yKey,
      props.aggregate,
    );

    const chartColor = props.color ?? "var(--chart-1)";

    const chartConfig = {
      [valueKey]: {
        label: valueKey,
        color: chartColor,
      },
    } satisfies ChartConfig;

    if (items.length === 0) {
      return (
        <div className="w-full">
          <div className="text-center py-4 text-muted-foreground">
            No data available
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full"
          style={{ height: props.height ?? 300 }}
        >
          <RechartsLineChart accessibilityLayer data={items}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={`var(--color-${valueKey})`}
              strokeWidth={2}
              dot={false}
            />
          </RechartsLineChart>
        </ChartContainer>
      </div>
    );
  },
};

// =============================================================================
// Chart Helpers
// =============================================================================

function isISODate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // Check for ISO date format: YYYY-MM-DDTHH:mm:ss
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  // Format as "Mon DD" (e.g., "Feb 04")
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function processChartData(
  items: Array<Record<string, unknown>>,
  xKey: string,
  yKey: string,
  aggregate: "sum" | "count" | "avg" | null | undefined,
): { items: Array<Record<string, unknown>>; valueKey: string } {
  if (items.length === 0) {
    return { items: [], valueKey: yKey };
  }

  // Check if xKey contains date values
  const firstXValue = items[0]?.[xKey];
  const isDateKey = isISODate(firstXValue);

  // If no aggregation, just format dates and return
  if (!aggregate) {
    const formatted = items.map((item) => {
      const xValue = item[xKey];
      return {
        ...item,
        label:
          isDateKey && typeof xValue === "string"
            ? formatDateLabel(xValue)
            : String(xValue ?? ""),
      };
    });
    return { items: formatted, valueKey: yKey };
  }

  // Group items by xKey (use date string for dates)
  const groups = new Map<string, Array<Record<string, unknown>>>();

  for (const item of items) {
    const xValue = item[xKey];
    let groupKey: string;

    if (isDateKey && typeof xValue === "string") {
      // Group by date (YYYY-MM-DD)
      groupKey = xValue.split("T")[0] ?? xValue;
    } else {
      groupKey = String(xValue ?? "unknown");
    }

    const group = groups.get(groupKey) ?? [];
    group.push(item);
    groups.set(groupKey, group);
  }

  // Aggregate each group
  const valueKey = aggregate === "count" ? "count" : yKey;
  const aggregated: Array<Record<string, unknown>> = [];

  // Sort keys (for dates, this will be chronological)
  const sortedKeys = Array.from(groups.keys()).sort();

  for (const key of sortedKeys) {
    const group = groups.get(key)!;
    let value: number;

    if (aggregate === "count") {
      value = group.length;
    } else if (aggregate === "sum") {
      value = group.reduce((sum, item) => {
        const v = item[yKey];
        return sum + (typeof v === "number" ? v : parseFloat(String(v)) || 0);
      }, 0);
    } else {
      // avg
      const sum = group.reduce((s, item) => {
        const v = item[yKey];
        return s + (typeof v === "number" ? v : parseFloat(String(v)) || 0);
      }, 0);
      value = group.length > 0 ? sum / group.length : 0;
    }

    // Format label
    let label: string;
    if (isDateKey) {
      const date = new Date(key);
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
    } else {
      label = key;
    }

    aggregated.push({
      label,
      [valueKey]: value,
      _groupKey: key,
    });
  }

  return { items: aggregated, valueKey };
}

// =============================================================================
// Fallback Component
// =============================================================================

export function Fallback({ type }: { type: string }) {
  return (
    <div className="p-4 border border-dashed rounded-lg text-muted-foreground text-sm">
      Unknown component: {type}
    </div>
  );
}
