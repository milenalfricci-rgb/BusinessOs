import type { Meta, StoryObj } from "@storybook/nextjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

/**
 * Base shadcn `Card` primitive as configured for BusinessOS's B&W theme
 * (SPEC.md §7 item 4) — confirms the neutral color tokens and the raised
 * `--radius` (§6.3) are actually applying.
 */
const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Oferta</CardTitle>
        <CardDescription>
          Assinatura mensal de consultoria + software para founders solo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Atualizado em 11 de julho de 2026.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Abrir</Button>
      </CardFooter>
    </Card>
  ),
};
