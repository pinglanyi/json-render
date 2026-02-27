import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/store-utils.ts"],
  format: ["cjs", "esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: ["zod"],
}));
