import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    // Report anything over the perf budget in DESIGN.md §6 (150 KB gzip JS).
    chunkSizeWarningLimit: 500,
    cssCodeSplit: false,
    // Never base64-inline a font: it defeats HTTP caching and bloats the CSS
    // (a base64 woff2 does not gzip). Fonts stay as separate cacheable files.
    assetsInlineLimit: 0,
  },
  server: {
    port: 5180,
  },
  preview: {
    port: 5181,
  },
});
