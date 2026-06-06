import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const root = __dirname;

// https://vite.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(root, "dist"),
    emptyOutDir: true,
  },
});
