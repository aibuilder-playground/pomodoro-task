import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Host/puerto fijos: requeridos por la configuración de Tauri (tauri.conf.json -> build.devUrl)
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
  },
});
