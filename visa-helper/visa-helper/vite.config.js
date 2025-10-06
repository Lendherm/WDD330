import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./", // rutas relativas, ideal para Netlify y GitHub Pages
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin/index.html"),
      },
    },
  },
});
