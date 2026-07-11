import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs";

import { ViewToggle } from "./view-toggle";

/**
 * A shadcn `<Select>` with two options, "grid" and "list" (SPEC.md §6.6).
 * Purely controlled, so these stories fix `value` to show each selected
 * state; `onValueChange` is a Storybook `fn()` spy (no real persistence).
 */
const meta: Meta<typeof ViewToggle> = {
  title: "ContentCard/ViewToggle",
  component: ViewToggle,
  parameters: {
    layout: "centered",
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const GridSelected: Story = {
  args: {
    value: "grid",
  },
};

export const ListSelected: Story = {
  args: {
    value: "list",
  },
};
