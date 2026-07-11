import type { Preview } from "@storybook/nextjs";
import { Inter } from "next/font/google";

// Real design tokens, grayscale theme, and Tailwind base/components/utilities —
// see SPEC.md §6. Without this import components render with unstyled/default
// browser styling inside Storybook.
import "../app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
    },
  },
  decorators: [
    (Story) => (
      <div className={`${inter.variable} min-h-screen bg-background p-6 font-sans text-foreground antialiased`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
