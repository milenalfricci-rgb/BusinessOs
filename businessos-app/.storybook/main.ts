import path from "node:path";

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  // Colocated stories per SPEC.md §7 — not a separate top-level /stories tree.
  "stories": [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs",
  "staticDirs": [
    "..\\public"
  ],
  webpackFinal: async (webpackConfig) => {
    // `content-card.tsx` imports the "use server" `saveContentItem` action,
    // which (via lib/content.ts) imports `node:fs` to read/write
    // content/**/*.md. That's valid in a real Next.js server context but
    // isn't bundleable for the browser. Alias it to a Storybook-only mock
    // so ContentCard's stories don't try to pull `fs` into the client bundle.
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias ?? {}),
      "@/app/actions/content": path.resolve(
        process.cwd(),
        ".storybook/mocks/content-actions.ts"
      ),
    };
    return webpackConfig;
  },
};
export default config;