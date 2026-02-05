import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Disable prop-types - we use TypeScript for type checking
      "react/prop-types": "off",
    },
  },
];
