import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/catalog.ts"],
  format: ["cjs", "esm"],
  // Skip DTS generation in watch/dev mode — it runs the full TS compiler in a
  // separate process and causes OOM kills.  DTS is only needed for publishing.
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: [
    "react",
    "react-dom",
    "@json-render/core",
    "@json-render/react",
    "zod",
  ],
}));
