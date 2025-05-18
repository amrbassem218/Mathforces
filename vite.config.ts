import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import commonjs from 'vite-plugin-commonjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), commonjs()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
