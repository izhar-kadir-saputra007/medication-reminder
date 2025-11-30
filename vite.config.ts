import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png", 
        "favicon-32x32.png",
        "apple-icon-180x180.png",
        "android-icon-192x192.png"
      ],
      manifest: {
        name: "Pengingat Obat",
        short_name: "PengingatObat",
        description: "Aplikasi pengingat minum obat yang mudah digunakan",
        theme_color: "#3B82F6",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "android-icon-192x192.png",  // Gunakan yang sudah ada
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "ms-icon-310x310.png",  // Gunakan yang terbesar yang ada
            sizes: "310x310", 
            type: "image/png"
          }
        ],
        categories: ["health", "productivity"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3,wav,json}"],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));