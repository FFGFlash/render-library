import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
      lib: resolve(__dirname, "lib"),
    },
  },
  plugins: [tailwindcss()],
});
