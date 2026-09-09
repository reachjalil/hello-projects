import { existsSync } from "node:fs";
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "http://localhost:4330",
  session: false,
  trailingSlash: "never",
  devToolbar: { enabled: false },
  adapter: cloudflare({
    configPath: existsSync("./wrangler.local.json")
      ? "./wrangler.local.json"
      : "./wrangler.jsonc",
    remoteBindings: false,
    persistState: true,
    imageService: "compile",
  }),
  vite: {
    cacheDir: process.argv.includes("check")
      ? "node_modules/.vite-check"
      : "node_modules/.vite",
    optimizeDeps: { exclude: ["cloudflare:workers"] },
  },
});
