import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["cjs", "esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: ["react", "react-dom", "remotion", "@json-render/core", "zod"],
}));
