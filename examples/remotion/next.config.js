/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@json-render/core", "@json-render/remotion"],
  serverExternalPackages: ["@ai-sdk/openai"],
  // Turbopack is the default in Next.js 16; an empty config silences the
  // "webpack config but no turbopack config" error.
  turbopack: {},
};

export default nextConfig;
