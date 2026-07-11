import type { Meta, StoryObj } from "@storybook/nextjs";

import { ContentCard } from "./content-card";
import type { ContentItem, ContentStatus } from "@/lib/content.types";

/**
 * Renders one `ContentItem` in grid or list mode (SPEC.md §6.5). Both modes
 * read from the exact same `ContentItem` prop. Note: the component's edit
 * dialog calls the `saveContentItem` Server Action, which is aliased to a
 * Storybook-only mock in `.storybook/main.ts` (the real action touches the
 * filesystem via `lib/content.ts`, which isn't bundleable for the browser).
 */
function makeItem(overrides: Partial<ContentItem["frontmatter"]> = {}): ContentItem {
  return {
    frontmatter: {
      title: "Oferta",
      section: "direcao",
      slug: "oferta",
      summary: "Assinatura mensal de consultoria + software para founders solo.",
      status: "in_progress",
      updated_at: "2026-07-11T14:30:00.000Z",
      related: ["validacao/oferta"],
      tags: [],
      ...overrides,
    },
    body: "## O que estamos vendendo\n\n...",
    filePath: `${overrides.section ?? "direcao"}/${overrides.slug ?? "oferta"}.md`,
  };
}

const LONG_ITEM = makeItem({
  title:
    "Um título extremamente longo para testar o overflow do card em modo grid e em modo lista, incluindo quebras de linha",
  summary:
    "Um resumo igualmente longo, cheio de detalhes desnecessários, pensado especificamente para verificar que o truncamento (line-clamp / truncate) funciona corretamente tanto no modo grid quanto no modo lista, mesmo quando o texto é muito maior do que o espaço disponível no card.",
  slug: "long-title-case",
});

const meta: Meta<typeof ContentCard> = {
  title: "ContentCard/ContentCard",
  component: ContentCard,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ContentCard>;

// --- Grid mode -------------------------------------------------------------

export const GridNormal: Story = {
  name: "Grid — normal content",
  args: {
    item: makeItem(),
    mode: "grid",
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};

export const GridLongTitleOverflow: Story = {
  name: "Grid — long title/summary overflow",
  args: {
    item: LONG_ITEM,
    mode: "grid",
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};

// --- List mode ---------------------------------------------------------

export const ListNormal: Story = {
  name: "List — normal content",
  args: {
    item: makeItem(),
    mode: "list",
  },
  decorators: [(Story) => <div className="w-full max-w-3xl"><Story /></div>],
};

export const ListLongTitleOverflow: Story = {
  name: "List — long title/summary overflow",
  args: {
    item: LONG_ITEM,
    mode: "list",
  },
  decorators: [(Story) => <div className="w-full max-w-3xl"><Story /></div>],
};

// --- Every status value, at least once ----------------------------------

const STATUSES: ContentStatus[] = ["draft", "in_progress", "validated", "stale"];

export const AllStatuses: Story = {
  name: "Grid — every status value",
  render: () => (
    <div className="grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
      {STATUSES.map((status) => (
        <ContentCard
          key={status}
          mode="grid"
          item={makeItem({
            title: status,
            slug: status,
            status,
          })}
        />
      ))}
    </div>
  ),
};
