# BusinessOS — Product Requirements Document

Related reading: `BRIEFING.md` for the one-page context, `SPEC.md` for the
technical implementation spec these requirements map to.

## 1. Goals

1. Give the founder a single structured place to record and revisit the
   core facts and decisions of the business, organized around four
   sections: Founder, Direction, Validation, Cash.
2. Make that content trivially readable and writable by AI agents, using
   plain markdown files with frontmatter as the shared substrate — no
   bespoke API required for an agent to participate.
3. Keep the founder's editing experience fast and low-friction: open a
   section, scan cards, open one, edit it, done.
4. Lay groundwork (file conventions, schema) that a future Supabase-backed,
   multi-agent version can build on without a rewrite of the content model.

## 2. Success criteria (v1)

- The founder can navigate to all 4 section pages via a sidebar and see
   every sub-item as a card.
- The founder can open any card, edit its frontmatter fields and its
  markdown body, save, and see the change reflected immediately (and
  persisted to disk as a `.md` file).
- Every content file conforms to one consistent frontmatter schema,
  regardless of section — so a future agent or script can operate uniformly
  across all content without per-section special-casing.
- The founder can toggle each section's card layout between grid and list,
  and that preference persists across visits.
- An external process (a script, a CLI agent, an editor) can read or edit
  any content file directly and have the app reflect the change on next
  load, with zero coordination beyond "edit the markdown file correctly."

## 3. User / persona

**The Founder** — solo operator of BusinessOS. Non-technical-ish: comfortable
with modern web apps (forms, cards, dropdowns) but not expected to write
code or touch YAML by hand through anything other than the app's own edit
UI. Wants a fast, calm, low-decoration tool — the opposite of a cluttered
dashboard. Will, over time, delegate parts of this content's upkeep to AI
agents/skills and wants that path to be technically unblocked even if not
fully built yet.

## 4. Feature list (v1)

### 4.1 Sidebar navigation
- Persistent sidebar with the 4 top-level sections, in this order:
  **Founder (Fundador)**, **Direction (Direção)**, **Validation
  (Validação)**, **Cash (Caixa)**.
- Each top-level section is a link to its page. Sub-items are not separate
  routes; they render as cards on the section's page (see 4.2).
- Optionally, the sidebar may show sub-items nested under each section
  label as a visual outline (non-navigating, or anchor-scroll to the card),
  but the routable unit is the section, not the sub-item.
- Hover state: hovered nav item gets a background fill (see SPEC.md design
  tokens).

### 4.2 Section pages (4 total)
One page per top-level section:
- `Fundador` — cards: Objetivo, Estilo de vida.
- `Direção` — cards: Mapa do Mercado, Mapa de Problemas, Perfil Ideal de
  Cliente, Tese de Valor, Oferta.
- `Validação` — cards: Oferta, Primeiros clientes.
- `Caixa` — cards: Fluxo de Caixa, ERP.

Each page renders its section's items as a set of cards, in the order
listed above, using the section's current view mode (grid or list).

### 4.3 Card component
- Displays, at minimum: title, one-line summary, status, last-updated date.
- Two render modes: **grid** (visual, denser, summary-only) and **list**
  (single-column, slightly more detail per row). Same underlying data,
  different layout.
- Clicking a card opens it for reading/editing (in-place expansion or a
  detail view — implementation detail left to SPEC.md; either is
  acceptable as long as it is consistent across all cards).

### 4.4 View toggle (grid/list)
- A `<Select>` control per section page, switching that section's cards
  between grid and list.
- The chosen view mode **persists** per section across sessions (e.g. via
  `localStorage` or a cookie) so the founder doesn't have to re-toggle each
  visit.

### 4.5 Edit-in-place
- Every card can be opened into an edit state exposing:
  - The relevant frontmatter fields (title, summary, status, tags, related)
    as form fields.
  - The markdown body as a free-text editor.
- Saving writes the updated frontmatter + body back to the corresponding
  content file, updating `updated_at`.
- No autosave requirement for v1 — an explicit save action is sufficient.

### 4.6 Content read/write behavior
- All reads and writes for section pages and cards go through one shared
  content module (see SPEC.md `lib/content.ts`) — the UI never parses
  frontmatter ad hoc.
- Writes happen through Next.js Server Actions, operating directly on the
  local filesystem. No network API layer, no database round-trip.

## 5. Out of scope for v1

- **Authentication** of any kind (no login, no session, single implicit
  user).
- **Multi-user** support — no roles, no sharing, no concurrent-edit
  handling beyond "last write wins" on the filesystem.
- **Supabase integration** — noted as future direction only (see
  BRIEFING.md); v1 has no database.
- **Real agent orchestration UI** — v1 does not ship any UI for
  registering, running, or monitoring AI agents/skills. It only ships the
  file conventions (documented in SPEC.md) that make such agents possible
  to build later without changing the content model.
- **Search, filtering, tagging UI** beyond what's needed to render a
  section's cards (tags exist in the schema for future use but need no
  dedicated UI in v1).
- **Versioning/history UI** for content files (git or otherwise) — content
  files may incidentally be under version control, but BusinessOS itself
  does not provide a history view in v1.

## 6. Roadmap / future phases

1. **Supabase integration** — migrate persistence (and later auth) from
   local markdown files to a Supabase-backed store, likely keeping the same
   `ContentItem`/`Frontmatter` shape so the UI layer barely changes.
2. **Auth** — single-user login at minimum, to support Supabase-hosted
   deployment outside of `localhost`.
3. **Agent/skill orchestration UI** — an "Agents" page where the founder
   can see which agents/skills are wired to which sections/items, trigger
   them manually, and review what they last read or changed. Built on top
   of the same `content/**/*.md` conventions established in v1.
4. **Richer editing** — inline markdown preview, diffing of agent-proposed
   edits before accepting them, comment/suggestion mode.
5. **Multi-workspace / multi-business support**, if the founder ever runs
   more than one business through BusinessOS.
