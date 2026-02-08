import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3889
  },
  resolve: {
    alias: {
      // Dev modda kerzz-grid'i doğrudan source'dan oku (build gerekmez)
      "@kerzz/grid/styles.css": path.resolve(__dirname, "../../packages/kerzz-grid/src/theme/grid-base.css"),
      "@kerzz/grid": path.resolve(__dirname, "../../packages/kerzz-grid/src/index.ts"),
      // Monorepo paketlerinin aynı React instance'ını kullanmasını sağla
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "../../node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: [],
  },
});
