import type { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "./button";

/**
 * Base shadcn `Button` primitive as configured for BusinessOS's B&W theme
 * (SPEC.md §7 item 4) — confirms the neutral color tokens and the raised
 * `--radius` (§6.3) are actually applying, not default browser styling.
 */
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Salvar",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
