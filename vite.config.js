import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173,
    strictPort: false,
    allowedHosts: [
      "a-life-worth-celebrating-cdbfc4980cb4.herokuapp.com",
      ".herokuapp.com",
    ],
  },
});
