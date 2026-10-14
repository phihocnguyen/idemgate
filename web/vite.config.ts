import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production: served by Spring at http://host:8080/ui/
export default defineConfig({
  plugins: [react()],
  base: "/ui/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/v1": "http://localhost:8080",
    },
  },
});
