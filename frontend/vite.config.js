import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import YAML from "yamljs";
import { nitro } from "nitro/vite";

const swaggerDocument = YAML.parse(
  readFileSync(
    new URL("../backend/src/docs/swagger.yaml", import.meta.url),
    "utf8"
  )
);

export default defineConfig({
  define: {
    __FINBOAT_SWAGGER_DOCUMENT__: JSON.stringify(swaggerDocument),
  },
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
