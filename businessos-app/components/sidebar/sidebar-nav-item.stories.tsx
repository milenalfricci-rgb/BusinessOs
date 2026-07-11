import type { Meta, StoryObj } from "@storybook/nextjs";

import { SidebarNavItem } from "./sidebar-nav-item";

/**
 * `SidebarNavItem` drives the 4 section links in the sidebar (SPEC.md §6.4).
 * It uses `usePathname()` internally to determine the active state, so these
 * stories rely on Storybook's Next.js framework integration to mock
 * `next/navigation` via `parameters.nextjs.navigation`.
 *
 * `parameters.nextjs.appDirectory: true` is required here — without it,
 * `@storybook/nextjs`'s router decorator mounts the *Pages* Router mock
 * instead of the App Router one, which never provides the `PathnameContext`
 * that `usePathname()` reads from, so `navigation.pathname` would silently
 * have no effect and every story would render as "inactive".
 *
 * The real `:hover` pseudo-class is of course visible any time a reader
 * moves their pointer over the `Default` story in Storybook's canvas (the
 * component's own `hover:bg-accent` handles that with no special setup).
 * The dedicated `Hover` story below additionally *forces* that same visual
 * (via a wrapper that overrides the anchor's background/text color to match
 * `hover:bg-accent`/`hover:text-accent-foreground`) so the state is visible
 * in a static snapshot too, without depending on a real pointer event or a
 * CSS-pseudo-forcing addon.
 */
const meta: Meta<typeof SidebarNavItem> = {
  title: "Sidebar/SidebarNavItem",
  component: SidebarNavItem,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="w-60 rounded-xl border border-border bg-background p-2">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/direcao",
    label: "Direção",
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNavItem>;

/** Default (inactive) state — current route does not match `href`. */
export const Default: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/fundador",
      },
    },
  },
};

/**
 * Hover state — forces the `hover:bg-accent`/`hover:text-accent-foreground`
 * look via a wrapper override so it's visible without a real pointer event.
 */
export const Hover: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/fundador",
      },
    },
  },
  decorators: [
    // Layered on top of the meta-level wrapper decorator; only adds the
    // forced hover-look override, doesn't repeat the outer box styling.
    (Story) => (
      <div className="[&_a]:bg-accent [&_a]:text-accent-foreground">
        <Story />
      </div>
    ),
  ],
};

/** Active state — current route matches `href`, so `bg-accent` is applied. */
export const Active: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/direcao",
      },
    },
  },
};
