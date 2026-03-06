/**
 * Vue component implementations for each catalog entry.
 *
 * Each function receives { props, children, emit, bindings } and must return
 * a VNode (or null). No external UI library is used — all components are
 * plain HTML with inline styles so the demo is fully self-contained.
 */
import { h } from "vue";
import type { Components } from "@json-render/vue";
import { useBoundProp } from "@json-render/vue";
import type { ChatCatalog } from "./catalog.js";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const px = (n: number | null | undefined) => (n != null ? `${n}px` : undefined);

// ---------------------------------------------------------------------------
// Chart helpers (inline SVG bar / line / pie — no external lib required)
// ---------------------------------------------------------------------------

function renderBarChart(props: {
  title?: string | null;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string | null;
  height?: number | null;
}) {
  const h_ = props.height ?? 200;
  const color = props.color ?? "#3b82f6";
  const maxVal = Math.max(
    1,
    ...props.data.map((d) => Number(d[props.yKey] ?? 0)),
  );
  const barW = props.data.length > 0 ? 80 / props.data.length : 10;
  const gap = barW * 0.2;

  return h(
    "div",
    { style: { fontFamily: "inherit", padding: "12px" } },
    [
      props.title &&
        h(
          "div",
          {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              textAlign: "center",
            },
          },
          props.title,
        ),
      h(
        "svg",
        {
          viewBox: `0 0 100 ${h_}`,
          style: { width: "100%", height: `${h_}px`, overflow: "visible" },
          preserveAspectRatio: "none",
        },
        props.data.map((d, i) => {
          const val = Number(d[props.yKey] ?? 0);
          const barH = (val / maxVal) * (h_ - 30);
          const x = i * barW + gap / 2;
          const y = h_ - 20 - barH;
          return h("g", { key: i }, [
            h("rect", {
              x: `${x}%`,
              y,
              width: `${barW - gap}%`,
              height: barH,
              fill: color,
              rx: 3,
            }),
            h(
              "text",
              {
                x: `${x + (barW - gap) / 2}%`,
                y: h_ - 4,
                textAnchor: "middle",
                fontSize: "6",
                fill: "#6b7280",
              },
              String(d[props.xKey] ?? ""),
            ),
          ]);
        }),
      ),
    ].filter(Boolean),
  );
}

function renderLineChart(props: {
  title?: string | null;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string | null;
  height?: number | null;
}) {
  const h_ = props.height ?? 200;
  const color = props.color ?? "#3b82f6";
  const vals = props.data.map((d) => Number(d[props.yKey] ?? 0));
  const maxVal = Math.max(1, ...vals);
  const n = props.data.length;

  const points = props.data.map((d, i) => {
    const x = n <= 1 ? 50 : (i / (n - 1)) * 96 + 2;
    const y = h_ - 20 - (Number(d[props.yKey] ?? 0) / maxVal) * (h_ - 30);
    return `${x},${y}`;
  });

  return h(
    "div",
    { style: { fontFamily: "inherit", padding: "12px" } },
    [
      props.title &&
        h(
          "div",
          {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              textAlign: "center",
            },
          },
          props.title,
        ),
      h(
        "svg",
        {
          viewBox: `0 0 100 ${h_}`,
          style: { width: "100%", height: `${h_}px`, overflow: "visible" },
          preserveAspectRatio: "none",
        },
        [
          h("polyline", {
            points: points.join(" "),
            fill: "none",
            stroke: color,
            strokeWidth: "2",
            strokeLinejoin: "round",
            strokeLinecap: "round",
          }),
          ...props.data.map((d, i) => {
            const [x, y] = (points[i] ?? "0,0").split(",");
            return h("circle", {
              key: i,
              cx: x,
              cy: y,
              r: 2,
              fill: color,
            });
          }),
          ...props.data.map((d, i) => {
            const x = n <= 1 ? 50 : (i / (n - 1)) * 96 + 2;
            return h(
              "text",
              {
                key: `lbl-${i}`,
                x,
                y: h_ - 4,
                textAnchor: "middle",
                fontSize: "6",
                fill: "#6b7280",
              },
              String(d[props.xKey] ?? ""),
            );
          }),
        ],
      ),
    ].filter(Boolean),
  );
}

function renderPieChart(props: {
  title?: string | null;
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  height?: number | null;
}) {
  const size = props.height ?? 200;
  const total = props.data.reduce(
    (s, d) => s + Number(d[props.valueKey] ?? 0),
    0,
  );
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];
  let angle = -Math.PI / 2;

  const slices = props.data.map((d, i) => {
    const val = Number(d[props.valueKey] ?? 0);
    const sweep = (val / (total || 1)) * Math.PI * 2;
    const r = size * 0.38;
    const cx = size / 2;
    const cy = size / 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
    return h("path", {
      key: i,
      d: path,
      fill: COLORS[i % COLORS.length],
    });
  });

  const legend = props.data.map((d, i) =>
    h(
      "div",
      {
        key: i,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#374151",
        },
      },
      [
        h("div", {
          style: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: COLORS[i % COLORS.length],
            flexShrink: "0",
          },
        }),
        h("span", {}, String(d[props.nameKey] ?? "")),
      ],
    ),
  );

  return h(
    "div",
    { style: { fontFamily: "inherit", padding: "12px" } },
    [
      props.title &&
        h(
          "div",
          {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              textAlign: "center",
            },
          },
          props.title,
        ),
      h("div", { style: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" } }, [
        h("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { flexShrink: "0" } }, slices),
        h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, legend),
      ]),
    ].filter(Boolean),
  );
}

// ---------------------------------------------------------------------------
// Component registry
// ---------------------------------------------------------------------------

export const components: Components<ChatCatalog> = {
  // ── Layout ────────────────────────────────────────────────────────────────
  Stack: ({ props, children }) =>
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: props.direction === "horizontal" ? "row" : "column",
          gap: px(props.gap) ?? "8px",
          alignItems:
            props.align ??
            (props.direction === "horizontal" ? "center" : "stretch"),
          flexWrap: props.wrap ? "wrap" : undefined,
        },
      },
      children,
    ),

  Grid: ({ props, children }) =>
    h(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: `repeat(${props.columns ?? 2}, 1fr)`,
          gap: px(props.gap) ?? "12px",
        },
      },
      children,
    ),

  Card: ({ props, children }) =>
    h(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        },
      },
      [
        props.title &&
          h(
            "h3",
            {
              style: {
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 4px 0",
              },
            },
            props.title,
          ),
        props.subtitle &&
          h(
            "p",
            {
              style: {
                fontSize: "13px",
                color: "#6b7280",
                margin: "0 0 12px 0",
              },
            },
            props.subtitle,
          ),
        children,
      ].filter(Boolean),
    ),

  Divider: () =>
    h("hr", {
      style: {
        border: "none",
        borderTop: "1px solid #e5e7eb",
        margin: "8px 0",
      },
    }),

  // ── Typography ─────────────────────────────────────────────────────────────
  Heading: ({ props }) => {
    const sizeMap: Record<string, string> = {
      "1": "24px",
      "2": "20px",
      "3": "16px",
      "4": "14px",
    };
    const tag = `h${props.level ?? "2"}` as keyof HTMLElementTagNameMap;
    return h(
      tag,
      {
        style: {
          fontSize: sizeMap[props.level ?? "2"] ?? "20px",
          fontWeight: "700",
          color: "#111827",
          margin: "0 0 8px 0",
        },
      },
      props.text,
    );
  },

  Text: ({ props }) => {
    const sizeMap: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    const weightMap: Record<string, string> = {
      normal: "400",
      medium: "500",
      bold: "700",
    };
    return h(
      "p",
      {
        style: {
          fontSize: sizeMap[props.size ?? "md"] ?? "14px",
          fontWeight: weightMap[props.weight ?? "normal"] ?? "400",
          color: props.muted ? "#9ca3af" : "#374151",
          margin: 0,
          lineHeight: "1.6",
        },
      },
      String(props.content ?? ""),
    );
  },

  // ── Data display ───────────────────────────────────────────────────────────
  Metric: ({ props }) => {
    const trendColor =
      props.trend === "up"
        ? "#10b981"
        : props.trend === "down"
          ? "#ef4444"
          : "#6b7280";
    const trendArrow =
      props.trend === "up" ? "↑" : props.trend === "down" ? "↓" : "→";

    return h(
      "div",
      {
        style: {
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px",
        },
      },
      [
        h(
          "div",
          {
            style: {
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            },
          },
          props.label,
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
            },
          },
          [
            h(
              "span",
              {
                style: {
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#111827",
                },
              },
              String(props.value),
            ),
            props.trend &&
              h(
                "span",
                {
                  style: {
                    fontSize: "14px",
                    fontWeight: "600",
                    color: trendColor,
                  },
                },
                trendArrow,
              ),
          ].filter(Boolean),
        ),
        props.detail &&
          h(
            "div",
            {
              style: {
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "2px",
              },
            },
            props.detail,
          ),
      ].filter(Boolean),
    );
  },

  Badge: ({ props }) =>
    h(
      "span",
      {
        style: {
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "500",
          backgroundColor: props.color ? `${props.color}18` : "#eff6ff",
          color: props.color ?? "#2563eb",
          border: `1px solid ${props.color ? `${props.color}40` : "#bfdbfe"}`,
        },
      },
      props.label,
    ),

  Table: ({ props }) => {
    const data = Array.isArray(props.data) ? props.data : [];
    const columns = Array.isArray(props.columns) ? props.columns : [];

    return h(
      "div",
      { style: { overflowX: "auto" } },
      h(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          },
        },
        [
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              columns.map((col) =>
                h(
                  "th",
                  {
                    key: col.key,
                    style: {
                      padding: "8px 12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "2px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      whiteSpace: "nowrap",
                    },
                  },
                  col.label,
                ),
              ),
            ),
          ),
          h(
            "tbody",
            {},
            data.length === 0
              ? h(
                  "tr",
                  {},
                  h(
                    "td",
                    {
                      colSpan: columns.length,
                      style: {
                        textAlign: "center",
                        padding: "24px",
                        color: "#9ca3af",
                        fontSize: "13px",
                      },
                    },
                    props.emptyMessage ?? "No data",
                  ),
                )
              : data.map((row, i) =>
                  h(
                    "tr",
                    {
                      key: i,
                      style: {
                        backgroundColor: i % 2 === 0 ? "white" : "#f9fafb",
                      },
                    },
                    columns.map((col) =>
                      h(
                        "td",
                        {
                          key: col.key,
                          style: {
                            padding: "8px 12px",
                            borderBottom: "1px solid #f3f4f6",
                            color: "#374151",
                          },
                        },
                        String(row[col.key] ?? ""),
                      ),
                    ),
                  ),
                ),
          ),
        ],
      ),
    );
  },

  Callout: ({ props }) => {
    const typeStyles: Record<string, { bg: string; border: string; icon: string; label: string }> = {
      info: { bg: "#eff6ff", border: "#bfdbfe", icon: "ℹ️", label: "Info" },
      tip: { bg: "#f0fdf4", border: "#bbf7d0", icon: "💡", label: "Tip" },
      warning: { bg: "#fffbeb", border: "#fde68a", icon: "⚠️", label: "Warning" },
      important: { bg: "#fdf4ff", border: "#e9d5ff", icon: "📌", label: "Important" },
    };
    const style = typeStyles[props.type ?? "info"] ?? typeStyles.info;

    return h(
      "div",
      {
        style: {
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: "8px",
          padding: "12px 16px",
        },
      },
      [
        h(
          "div",
          { style: { fontWeight: "600", fontSize: "13px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" } },
          [style.icon, " ", props.title ?? style.label],
        ),
        h("p", { style: { fontSize: "13px", color: "#374151", margin: 0, lineHeight: "1.5" } }, props.content),
      ],
    );
  },

  Timeline: ({ props }) => {
    const statusColor: Record<string, string> = {
      completed: "#10b981",
      current: "#3b82f6",
      upcoming: "#d1d5db",
    };
    const items = Array.isArray(props.items) ? props.items : [];

    return h(
      "div",
      { style: { position: "relative", paddingLeft: "24px" } },
      [
        // vertical line
        h("div", {
          style: {
            position: "absolute",
            left: "7px",
            top: "4px",
            bottom: "4px",
            width: "2px",
            backgroundColor: "#e5e7eb",
          },
        }),
        ...items.map((item, i) => {
          const color = statusColor[item.status ?? "upcoming"] ?? "#d1d5db";
          return h(
            "div",
            {
              key: i,
              style: {
                position: "relative",
                marginBottom: i < items.length - 1 ? "20px" : 0,
              },
            },
            [
              // dot
              h("div", {
                style: {
                  position: "absolute",
                  left: "-21px",
                  top: "4px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: "2px solid white",
                  boxShadow: "0 0 0 2px " + color,
                },
              }),
              h("div", {}, [
                item.date &&
                  h(
                    "span",
                    { style: { fontSize: "11px", color: "#9ca3af", marginRight: "8px" } },
                    item.date,
                  ),
                h("span", { style: { fontSize: "13px", fontWeight: "600", color: "#111827" } }, item.title),
                item.description &&
                  h(
                    "p",
                    { style: { fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" } },
                    item.description,
                  ),
              ].filter(Boolean)),
            ],
          );
        }),
      ],
    );
  },

  Accordion: ({ props }) => {
    const items = Array.isArray(props.items) ? props.items : [];
    // Use a simple CSS-based accordion (details/summary elements)
    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      items.map((item, i) =>
        h(
          "details",
          {
            key: i,
            style: {
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            },
          },
          [
            h(
              "summary",
              {
                style: {
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#111827",
                  backgroundColor: "#f9fafb",
                  userSelect: "none",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              [item.title, h("span", { style: { fontSize: "12px", color: "#9ca3af" } }, "▾")],
            ),
            h(
              "div",
              {
                style: {
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#374151",
                  lineHeight: "1.6",
                  borderTop: "1px solid #e5e7eb",
                },
              },
              item.content,
            ),
          ],
        ),
      ),
    );
  },

  // ── Charts ─────────────────────────────────────────────────────────────────
  BarChart: ({ props }) => renderBarChart(props as Parameters<typeof renderBarChart>[0]),
  LineChart: ({ props }) => renderLineChart(props as Parameters<typeof renderLineChart>[0]),
  PieChart: ({ props }) => renderPieChart(props as Parameters<typeof renderPieChart>[0]),

  // ── Interactive ────────────────────────────────────────────────────────────
  Button: ({ props, emit }) => {
    const variantStyle: Record<string, { bg: string; color: string; border: string }> = {
      default: { bg: "#3b82f6", color: "white", border: "transparent" },
      secondary: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
      destructive: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
      outline: { bg: "transparent", color: "#374151", border: "#d1d5db" },
      ghost: { bg: "transparent", color: "#374151", border: "transparent" },
    };
    const sizeStyle: Record<string, { padding: string; fontSize: string }> = {
      sm: { padding: "4px 10px", fontSize: "12px" },
      default: { padding: "8px 16px", fontSize: "14px" },
      lg: { padding: "12px 24px", fontSize: "16px" },
    };
    const v = variantStyle[props.variant ?? "default"] ?? variantStyle.default;
    const s = sizeStyle[props.size ?? "default"] ?? sizeStyle.default;

    return h(
      "button",
      {
        disabled: !!props.disabled,
        onClick: () => emit("press"),
        style: {
          ...s,
          backgroundColor: v.bg,
          color: v.color,
          border: `1px solid ${v.border}`,
          borderRadius: "8px",
          cursor: props.disabled ? "not-allowed" : "pointer",
          fontWeight: "500",
          opacity: props.disabled ? "0.5" : "1",
          transition: "opacity 0.15s",
          fontFamily: "inherit",
        },
      },
      props.label,
    );
  },

  TextInput: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      [
        props.label &&
          h(
            "label",
            { style: { fontSize: "13px", fontWeight: "500", color: "#374151" } },
            props.label,
          ),
        h("input", {
          type: props.type ?? "text",
          value: value ?? "",
          placeholder: props.placeholder ?? "",
          onInput: (e: Event) => setValue((e.target as HTMLInputElement).value),
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            outline: "none",
            fontFamily: "inherit",
            width: "100%",
            boxSizing: "border-box",
          },
        }),
      ].filter(Boolean),
    );
  },

  RadioGroup: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const options = Array.isArray(props.options) ? props.options : [];

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "8px" } },
      [
        props.label &&
          h(
            "label",
            { style: { fontSize: "13px", fontWeight: "500", color: "#374151" } },
            props.label,
          ),
        ...options.map((opt) =>
          h(
            "label",
            {
              key: opt.value,
              style: {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151",
              },
            },
            [
              h("input", {
                type: "radio",
                name: props.label ?? "radio",
                value: opt.value,
                checked: value === opt.value,
                onChange: () => setValue(opt.value),
                style: { cursor: "pointer" },
              }),
              opt.label,
            ],
          ),
        ),
      ].filter(Boolean),
    );
  },

  SelectInput: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const options = Array.isArray(props.options) ? props.options : [];

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      [
        props.label &&
          h(
            "label",
            { style: { fontSize: "13px", fontWeight: "500", color: "#374151" } },
            props.label,
          ),
        h(
          "select",
          {
            value: value ?? "",
            onChange: (e: Event) => setValue((e.target as HTMLSelectElement).value),
            style: {
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
              backgroundColor: "white",
              cursor: "pointer",
              width: "100%",
            },
          },
          [
            props.placeholder &&
              h("option", { value: "", disabled: true }, props.placeholder),
            ...options.map((opt) =>
              h("option", { key: opt.value, value: opt.value }, opt.label),
            ),
          ].filter(Boolean),
        ),
      ].filter(Boolean),
    );
  },

  Progress: ({ props }) => {
    const max = props.max ?? 100;
    const pct = Math.min(100, Math.max(0, (props.value / max) * 100));

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      [
        props.label &&
          h(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#6b7280",
              },
            },
            [props.label, `${Math.round(pct)}%`],
          ),
        h(
          "div",
          {
            style: {
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "999px",
              overflow: "hidden",
            },
          },
          h("div", {
            style: {
              height: "100%",
              width: `${pct}%`,
              backgroundColor: "#3b82f6",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            },
          }),
        ),
      ].filter(Boolean),
    );
  },

  Link: ({ props }) =>
    h(
      "a",
      {
        href: props.href,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          color: "#3b82f6",
          textDecoration: "underline",
          fontSize: "14px",
          cursor: "pointer",
        },
      },
      props.text,
    ),
};
