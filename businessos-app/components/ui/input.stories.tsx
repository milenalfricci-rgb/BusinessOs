import type { Meta, StoryObj } from "@storybook/nextjs";

import { Input } from "./input";

/**
 * Base shadcn `Input` primitive as configured for BusinessOS's B&W theme
 * (SPEC.md §7 item 4) — confirms the neutral color tokens and the raised
 * `--radius` (§6.3) are actually applying.
 */
const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "Título",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Não editável",
  },
  render: (args) => (
    <div className="w-72">
      <Input {...args} readOnly />
    </div>
  ),
};
