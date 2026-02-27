import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: ["@json-render/core", "@json-render/core/store-utils", "react"],
}));
