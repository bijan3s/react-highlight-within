import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const exampleDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(exampleDir, "..");

export default defineConfig({
  root: exampleDir,
  plugins: [react()],
  resolve: {
    alias: {
      "react-highlight-within": resolve(workspaceRoot, "src/index.tsx"),
    },
  },
  server: {
    fs: {
      allow: [workspaceRoot],
    },
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
