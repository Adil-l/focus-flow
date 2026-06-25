import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Allow access through temporary tunnels (ngrok) — Vite blocks unknown
    // Host headers by default. Leading dot = that domain and all subdomains.
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.dev", ".ngrok.app", ".ngrok.io", ".trycloudflare.com"],
    hmr: {
      overlay: true,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  }
}));
