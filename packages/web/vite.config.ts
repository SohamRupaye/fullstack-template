import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      /**
       * Proxy /api to the local Express server.
       * No CORS headers or extra config needed in dev.
       * In production, configure your reverse proxy (nginx, Caddy, etc.) the same way.
       */
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
