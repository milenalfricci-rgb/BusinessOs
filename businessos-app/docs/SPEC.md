# BusinessOS — Technical Specification

Status: authoritative for v1. If something here conflicts with PRD.md or
BRIEFING.md on a product-level question, this file wins for implementation
details; PRD.md wins for scope questions. Anyone building a piece of this
app should be able to do so from this document alone, without guessing.

---

## 1. Folder structure (`businessos-app/`)

```
businessos-app/
├── docs/                        # this documentation (already exists)
│   ├── BRIEFING.md
│   ├── PRD.md
│   └── SPEC.md
├── content/                     # THE data — markdown + frontmatter, see §2
│   ├── fundador/
│   ├── direcao/
│   ├── validacao/
│   └── caixa/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # root layout: fonts, sidebar shell
│   ├── page.tsx                 # "/" — see §5 for redirect/dashboard decision
│   ├── globals.css              # tailwind base + design tokens (§6)
│   ├── fundador/
│   │   └── page.tsx             # "/fundador" section page
│   ├── direcao/
│   │   └── page.tsx             # "/direcao" section page
│   ├── validacao/
│   │   └── page.tsx             # "/validacao" section page
│   ├── caixa/
│   │   └── page.tsx             # "/caixa" section page
│   └── actions/
│       └── content.ts           # Server Actions wrapping lib/content.ts writes
├── lib/
│   ├── content.ts               # content read/write API — see §4
│   ├── content.types.ts         # ContentItem / Frontmatter types — see §4
│   └── utils.ts                 # shadcn's cn() helper, misc utilities
├── components/
│   ├── ui/                      # shadcn/ui primitives (button, card, select, input, ...)
│   ├── sidebar/
│   │   ├── sidebar.tsx
│   │   └── sidebar-nav-item.tsx
│   ├── content-card/
│   │   ├── content-card.tsx     # renders one ContentItem, grid or list mode
│   │   └── view-toggle.tsx      # the grid/list <Select>
│   └── section-page/
│       └── section-page.tsx     # shared layout: heading + card collection + toggle
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── components.json              # shadcn/ui config (see §6)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

Notes:
- `content/` lives at the project root (sibling to `app/`), not under
  `public/`, since it is read/written server-side only, never served
  statically as-is.
- `app/actions/content.ts` is the only place `"use server"` write functions
  live; pages and client components call into it, never touch the
  filesystem directly.

---

## 2. Content directory layout

One file per sub-item, one folder per top-level section. Exact paths
(relative to `content/`):

```
fundador/objetivo.md
fundador/estilo-de-vida.md

direcao/mapa-do-mercado.md
direcao/mapa-de-problemas.md
direcao/perfil-ideal-de-cliente.md
direcao/tese-de-valor.md
direcao/oferta.md

validacao/oferta.md
validacao/primeiros-clientes.md

caixa/fluxo-de-caixa.md
caixa/erp.md
```

Section slugs (used as folder names, route segments, and the `section`
frontmatter value): `fundador`, `direcao`, `validacao`, `caixa`.

Item slugs are kebab-case, accent-free, derived from the Portuguese name
(e.g. "Perfil Ideal de Cliente" → `perfil-ideal-de-cliente`, "Tese de
Valor" → `tese-de-valor`).

### 2.1 The two "Oferta" files are intentionally distinct

`direcao/oferta.md` and `validacao/oferta.md` are **two separate files with
the same display title ("Oferta") but different meaning and content**:

- `direcao/oferta.md` is where the offer is **defined/drafted** — the
  founder's current articulation of what is being sold, to whom, at what
  price/structure. This is upstream, hypothesis-stage content.
- `validacao/oferta.md` is where that offer gets **validated against the
  market** — evidence, experiments run, customer reactions, what changed
  after testing. This is downstream, evidence-stage content.

They are never merged into one file and never share a slug path — a reader
(human or agent) always disambiguates by section (`direcao` vs
`validacao`), never by slug alone, since the slug `oferta` is not globally
unique across sections.

The two files cross-link via the `related` frontmatter field:
- `direcao/oferta.md` has `related: ["validacao/oferta"]`
- `validacao/oferta.md` has `related: ["direcao/oferta"]`

`related` entries use the `section/slug` form (not a bare slug), precisely
because slugs are only unique within a section, not globally. This is the
general rule for every `related` reference in the system, not just this
pair.

---

## 3. Frontmatter schema

Every content file under `content/**/*.md` starts with YAML frontmatter
matching this shape exactly. All content files use the same schema — no
per-section variants.

```yaml
---
title: string
section: fundador | direcao | validacao | caixa
slug: string
summary: string
status: draft | in_progress | validated | stale
updated_at: string   # ISO 8601, e.g. "2026-07-11T14:30:00.000Z"
related: string[]    # optional, "section/slug" entries, e.g. ["validacao/oferta"]
tags: string[]       # optional, free-form strings
---
```

Field notes:
- `title` — human-facing name shown on the card and detail view (e.g.
  "Oferta", "Fluxo de Caixa"). Not necessarily unique across sections (see
  the two Oferta files).
- `section` — must match the containing folder; one of the four fixed
  section slugs. Used so a `ContentItem` is self-describing even if passed
  around without its file path.
- `slug` — must match the filename without `.md`; item-local identifier,
  unique within its section, not necessarily unique globally.
- `summary` — one line, shown on the card in both grid and list mode. Kept
  separate from the markdown body so cards can render a preview without
  parsing/truncating body markdown.
- `status` — lifecycle marker for the content itself (not the business):
  `draft` (not fleshed out yet), `in_progress` (actively being worked on),
  `validated` (founder or an agent considers this settled/confirmed),
  `stale` (known to need revisiting, e.g. facts have likely changed).
- `updated_at` — set programmatically by `lib/content.ts` on every write;
  never hand-edited through the UI form.
- `related` — optional array of `section/slug` strings pointing at other
  content items. Used for the Direção/Validação Oferta link, and available
  generally (e.g. `direcao/tese-de-valor.md` could relate to
  `direcao/perfil-ideal-de-cliente.md`).
- `tags` — optional, no controlled vocabulary in v1; reserved for future
  filtering UI and for agents to annotate content (e.g. `needs-review`,
  `agent-proposed`).

The markdown body (everything after the closing `---`) is the long-form,
freely-edited content — the actual substance of that Founder/Direção/
Validação/Caixa item. It has no imposed internal structure in v1; headings
within it are at the founder's/agent's discretion.

### 3.1 Example file

`content/direcao/oferta.md`:

```markdown
---
title: Oferta
section: direcao
slug: oferta
summary: Assinatura mensal de consultoria + software para founders solo.
status: in_progress
updated_at: 2026-07-11T14:30:00.000Z
related: ["validacao/oferta"]
tags: []
---

## O que estamos vendendo

...

## Preço e estrutura

...
```

---

## 4. Content API contract (`lib/content.ts`)

Two independent builders — one implementing Server Actions that write
content, one building pages/components that read it — must agree on this
module without coordinating directly. The signatures below are the
contract; implementations must not deviate from these names, parameter
orders, or return shapes.

### 4.1 Types (`lib/content.types.ts`)

```typescript
export type Section = "fundador" | "direcao" | "validacao" | "caixa";

export type ContentStatus = "draft" | "in_progress" | "validated" | "stale";

export interface Frontmatter {
  title: string;
  section: Section;
  slug: string;
  summary: string;
  status: ContentStatus;
  updated_at: string;       // ISO 8601 string
  related?: string[];       // "section/slug" entries
  tags?: string[];
}

export interface ContentItem {
  frontmatter: Frontmatter;
  body: string;             // raw markdown, frontmatter stripped
  filePath: string;         // path relative to content/, e.g. "direcao/oferta.md"
}
```

`ContentItem` is the one shape passed between `lib/content.ts` and every
page/component — nothing downstream re-parses frontmatter itself.

### 4.2 Functions (`lib/content.ts`)

```typescript
// Read every item in a section, in the fixed display order defined for
// that section (see PRD.md §4.2 / this file §2 for the canonical order).
// Throws if the section itself is invalid; returns [] only if the section
// folder exists but is empty (should not happen given the fixed item set).
function listSection(section: Section): ContentItem[];

// Read a single item. Throws a descriptive error if the file does not
// exist or fails frontmatter validation (missing required field, wrong
// `section`/`slug` value vs. the file's actual location, etc).
function getContentItem(section: Section, slug: string): ContentItem;

// Partial update: merge `data.frontmatter` into the existing frontmatter
// (shallow merge — arrays like `related`/`tags` are replaced wholesale,
// not merged element-by-element), replace `body` if provided, and
// ALWAYS overwrite `updated_at` to the current time on any call,
// regardless of whether frontmatter was passed. Writes the file back to
// disk atomically (write to a temp file, then rename) using `gray-matter`
// to re-serialize. Returns nothing; callers re-fetch via
// getContentItem/listSection to get the fresh state.
function updateContentItem(
  section: Section,
  slug: string,
  data: { frontmatter?: Partial<Frontmatter>; body?: string }
): void;
```

Implementation requirements (binding, not suggestions):
- Parsing/serializing frontmatter uses `gray-matter`.
- All three functions read/write the local filesystem directly, under
  `content/<section>/<slug>.md`, resolved relative to the project root
  (e.g. via `process.cwd()`), never a hardcoded absolute path.
- `section` and `slug` together are always the on-disk address; there is
  no separate ID field and no in-memory index/database in v1 — every call
  hits the filesystem.
- `updateContentItem` is only ever called from a Server Action (see §4.3)
  — never from a Client Component directly, since it performs filesystem
  writes.
- Validation errors (bad `status` enum value, missing `title`, mismatched
  `section`/`slug` vs. path) throw; callers are expected to surface these
  as user-facing errors, not silently swallow them.

### 4.3 Server Actions (`app/actions/content.ts`)

Thin wrappers, one per mutation the UI needs, e.g.:

```typescript
"use server";

export async function saveContentItem(
  section: Section,
  slug: string,
  data: { frontmatter?: Partial<Frontmatter>; body?: string }
): Promise<void> {
  updateContentItem(section, slug, data);
  revalidatePath(`/${section}`);
}
```

Reads (`listSection`, `getContentItem`) are called directly from Server
Components (page.tsx files) — they do not need a Server Action wrapper
since they perform no mutation.

---

## 5. Routing

| Route         | Renders                                   |
|---------------|--------------------------------------------|
| `/fundador`   | Fundador section page (Objetivo, Estilo de vida) |
| `/direcao`    | Direção section page (5 items, §2)        |
| `/validacao`  | Validação section page (Oferta, Primeiros clientes) |
| `/caixa`      | Caixa section page (Fluxo de Caixa, ERP)  |
| `/`           | Redirects to `/fundador`                  |

**Decision: `/` redirects to `/fundador`, it does not render a separate
dashboard.** Justification: v1 has exactly four peer sections and no
cross-section aggregate view worth building yet (no metrics, no feed) —
introducing a fifth "dashboard" concept would add a page with no unique
content in v1. `Fundador` is chosen as the landing section because it's
the most foundational/stable content (objective, lifestyle) and the
natural first stop conceptually. Implemented as a server-side redirect in
`app/page.tsx` (`redirect("/fundador")` from `next/navigation`), not a
client-side bounce.

---

## 6. Design system spec

### 6.1 Color tokens

Strictly black, white, and grays — no hue. Define as CSS variables in
`app/globals.css` (consumed by Tailwind via `components.json`/
`tailwind.config.ts` per shadcn conventions):

```css
:root {
  --background: 0 0% 100%;      /* white */
  --foreground: 0 0% 9%;        /* near-black text */
  --border: 0 0% 89%;           /* light gray borders */
  --muted: 0 0% 96%;            /* light gray fills (hover bg, subtle bg) */
  --muted-foreground: 0 0% 45%; /* secondary text */
  --accent: 0 0% 92%;           /* hover/active background */
  --ring: 0 0% 9%;              /* focus ring, near-black */
}

.dark {
  --background: 0 0% 9%;
  --foreground: 0 0% 98%;
  --border: 0 0% 20%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;
  --accent: 0 0% 18%;
  --ring: 0 0% 98%;
}
```

Dark mode is not a v1 requirement but the token structure should not
preclude it later; ship light mode only if time is short, using the
`:root` values above.

### 6.2 Typography

**Inter**, loaded via `next/font/google`:

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
```

Applied at the root layout (`app/layout.tsx`) on `<html>` or `<body>`.
Tailwind's `fontFamily.sans` should resolve to `var(--font-inter)`. No
second typeface anywhere in the app (including headings).

### 6.3 Border radius

Favor generous rounding everywhere — cards, buttons, inputs, the sidebar's
active/hover pill. Set shadcn's base radius token high:

```css
:root {
  --radius: 0.75rem; /* 12px base; shadcn derives sm/md/lg from this */
}
```

No sharp-cornered elements in the UI (radius should never drop to `0` for
any interactive or content-bearing element).

### 6.4 Sidebar interaction

- Sidebar nav items (the 4 section links) get a background fill
  (`bg-accent`, using the token above) on hover, and the same or a
  slightly stronger fill when the route is active — implemented via
  `components/sidebar/sidebar-nav-item.tsx`, driven by Next.js's
  `usePathname()` for the active check.
- Rounded corners on the nav item's hit area, consistent with §6.3.

### 6.5 Card component — grid vs. list

`components/content-card/content-card.tsx` renders a single `ContentItem`
in one of two modes, chosen by the parent section page:

- **Grid mode**: fixed/responsive-width tile, title + summary visible,
  status as a small badge, meant to be scanned visually in a multi-column
  layout (`grid grid-cols-2 md:grid-cols-3` or similar).
- **List mode**: full-width row, title + summary + status + updated date
  all on one line (or a tight two-line stack on narrow viewports),
  optimized for scanning many items quickly top-to-bottom.

Both modes read from the exact same `ContentItem` prop — no separate data
fetching per mode.

### 6.6 View-toggle control

`components/content-card/view-toggle.tsx` — a shadcn `<Select>` with two
options, `"grid"` and `"list"`. Lives at the top of each section page.
Selecting a value:
1. Updates the section page's rendered mode immediately (client state).
2. Persists the choice (e.g. `localStorage` key like
   `businessos:view-mode:<section>`, or a cookie if the read needs to
   happen server-side to avoid a flash) so it's remembered on return
   visits, per section.

### 6.7 Where this lives in config

- `components.json` (shadcn/ui config): base color set to a neutral/gray
  scale (not "slate"/"zinc" defaults with a hue — use shadcn's `neutral`
  or `gray` base, and override `--radius` as in §6.3), CSS variables mode
  enabled (`"cssVariables": true`) so the tokens in §6.1 apply globally.
- `tailwind.config.ts`: `fontFamily.sans` mapped to the Inter CSS variable
  (§6.2); `borderRadius` scale reading from `--radius` (shadcn's default
  generated scale is fine once `--radius` itself is raised).

---

## 7. Storybook scope

Stories required for v1 (one `.stories.tsx` colocated per component):

1. **`sidebar/sidebar-nav-item.tsx`** — default, hover, and active states.
2. **`content-card/content-card.tsx`** — grid mode and list mode, each
   with at least two states: normal content, and a long-title/long-summary
   overflow case. Cover each `status` value at least once across stories.
3. **`content-card/view-toggle.tsx`** — the Select in both its `grid` and
   `list` selected states.
4. Base shadcn primitives as configured for this theme (confirming the
   B&W tokens + radius actually apply): **Button**, **Card**, **Input**,
   at minimum in their default state.

`.storybook/main.ts` should point its `stories` glob at
`../components/**/*.stories.tsx` (colocated stories, not a separate
`/stories` tree).

---

## 8. Agent/skill integration conventions

BusinessOS deliberately has no API layer for agents in v1 — the
integration surface *is* the filesystem:

- Any external AI agent or skill with filesystem access to this project
  can read business context by reading `content/**/*.md` files directly,
  parsing frontmatter with any standard YAML frontmatter parser (the
  format is plain `gray-matter`-compatible frontmatter, nothing custom).
- An agent proposing or making an update should write back to the exact
  same file, preserving all existing frontmatter fields it isn't
  intentionally changing, and should set `status` and `updated_at`
  sensibly (`updated_at` to the current time; `status` left to the agent's
  judgement — e.g. an agent finishing research might set
  `validacao/oferta.md` to `validated`).
- Agents should use the `related` field (§2.1, §3) the same way the app
  does — `section/slug` strings — so links they add stay resolvable by
  both the UI and other agents.
- Because reads/writes go straight to disk with no locking in v1,
  agents editing content concurrently with the founder should treat this
  the same way two people editing a shared file would: last write wins,
  no merge support. This is an accepted v1 limitation, not an oversight.

Reserved for later (not created in this pass): a `docs/AGENTS.md`
convention for registering which named agents/skills are expected to
operate on which sections/items, and what each is responsible for keeping
up to date. This spec only reserves the name/location so a future pass has
an obvious place to put it — no such file exists yet.
