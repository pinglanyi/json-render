"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Changelog", href: "/docs/changelog" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Specs", href: "/docs/specs" },
      { title: "Schemas", href: "/docs/schemas" },
      { title: "Catalog", href: "/docs/catalog" },
      { title: "Registry", href: "/docs/registry" },
      { title: "Data Binding", href: "/docs/data-binding" },
      { title: "Visibility", href: "/docs/visibility" },
      { title: "Validation", href: "/docs/validation" },
    ],
  },
  {
    title: "Examples",
    items: [
      {
        title: "Dashboard",
        href: "https://github.com/vercel-labs/json-render/tree/main/examples/dashboard",
        external: true,
      },
      {
        title: "Remotion",
        href: "https://github.com/vercel-labs/json-render/tree/main/examples/remotion",
        external: true,
      },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Custom Schema", href: "/docs/custom-schema" },
      { title: "Streaming", href: "/docs/streaming" },
      { title: "Code Export", href: "/docs/code-export" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { title: "AI SDK", href: "/docs/ai-sdk" },
      { title: "A2UI", href: "/docs/a2ui" },
      { title: "Adaptive Cards", href: "/docs/adaptive-cards" },
      { title: "AG-UI", href: "/docs/ag-ui" },
      { title: "OpenAPI", href: "/docs/openapi" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "@json-render/core", href: "/docs/api/core" },
      { title: "@json-render/react", href: "/docs/api/react" },
      { title: "@json-render/remotion", href: "/docs/api/remotion" },
      { title: "@json-render/codegen", href: "/docs/api/codegen" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 pb-8">
      {navigation.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-normal text-muted-foreground/50 uppercase tracking-wider mb-2">
            {section.title}
          </h4>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const isExternal = "external" in item && item.external;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    {...(isExternal && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className={cn(
                      "text-sm transition-colors block py-1",
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground",
                      isExternal && "inline-flex items-center gap-1",
                    )}
                  >
                    {item.title}
                    {isExternal && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
