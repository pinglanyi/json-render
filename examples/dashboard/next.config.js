/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@json-render/core', '@json-render/react'],
  serverExternalPackages: ['@ai-sdk/openai'],
};

export default nextConfig;
