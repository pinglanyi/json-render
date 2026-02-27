import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/schema.ts"],
  format: ["cjs", "esm"],
  dts: options.watch ? false : { resolve: ["@internal/react-state"] },
  sourcemap: true,
  clean: !options.watch,
  noExternal: ["@internal/react-state"],
  external: ["react", "react-dom", "@json-render/core"],
}));
