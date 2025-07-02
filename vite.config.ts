import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    commonjs(),
    nodePolyfills({
      overrides: {
        fs: "memfs",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["latex.js"],
    exclude: [
      "latex.js/dist/documentclasses/.keep",
      "latex.js/dist/packages/.keep",
    ],
  },
  build: {
    commonjsOptions: {
      include: [/latex\.js/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [
        "latex.js/dist/documentclasses/.keep",
        "latex.js/dist/packages/.keep",
      ],
    },
  },
});
