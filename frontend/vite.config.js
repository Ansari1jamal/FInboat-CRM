import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nitro({
      preset: "vercel",
      serverDir: "./",
      output: {
        dir: "../.vercel/output",
      },
      rollupConfig: {
        external: ["swagger-ui-express"],
      },
      traceDeps: ["swagger-ui-express*"],
    }),
  ],
});
