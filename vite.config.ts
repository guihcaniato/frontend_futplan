import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy:{
      '/partidas': 'http://localhost:5000',
      '/times': 'http://localhost:5000',
      '/locais': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/usuarios': 'http://localhost:5000',
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
