import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: http://localhost:5173/
// Prod build: embedded by Spring at http://host:8080/ui/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/ui/" : "/",
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
}));
