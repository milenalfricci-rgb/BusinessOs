import { fn } from "storybook/test";

/**
 * Storybook-only stand-in for `app/actions/content.ts`.
 *
 * The real `saveContentItem` Server Action (indirectly, via `lib/content.ts`)
 * imports `node:fs` to read/write `content/**\/*.md` on disk. That's fine in
 * a real Next.js server context but breaks Storybook's browser webpack
 * bundle (there is no `fs` in the browser). `.storybook/main.ts` aliases
 * `@/app/actions/content` to this file so `ContentCard`'s edit dialog can
 * still call `saveContentItem` in stories without pulling in the real
 * filesystem-backed implementation.
 */
export const saveContentItem = fn(async () => {
  return undefined;
}).mockName("saveContentItem");
