// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/site.ts";
import { codeThemes, codeDefaultColor } from "./src/config/code.ts";

export default defineConfig({
  site: siteConfig.siteUrl,
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: codeThemes,
      defaultColor: codeDefaultColor,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
