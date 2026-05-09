import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const basePath = process.env.VITE_BASE_PATH ?? "/SimpleSpeech/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "SimpleSpeech AAC",
        short_name: "SimpleSpeech",
        description: "Offline-first picture speech communication app",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        cleanupOutdatedCaches: true
      }
    })
  ]
});
