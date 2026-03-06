import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      // Forward all /api requests to the Express backend during development
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
  },
});
