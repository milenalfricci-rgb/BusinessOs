# BusinessOS — Project Briefing

## What it is

BusinessOS is a personal "operating system" for a solo founder to run their
business. It is a decision-support system: a single place to write down and
maintain the core facts and decisions that define the business — who it's
for, what problem it solves, what the offer is, whether it's been validated,
how the cash is doing — organized as a small set of structured pages.

The same content is meant to be read and written by AI agents and skills
that work alongside the founder. BusinessOS is not just a UI for a human;
it's a shared workspace where a person and one or more AI collaborators
operate on the same underlying facts.

## Who it's for

One user: the founder, solo. Comfortable using a simple, modern web app but
not necessarily technical. No team accounts, no multi-user permissions, no
customer-facing surface — this is an internal tool for one person (plus
their AI agents).

## Why it exists

Running a business solo means the important decisions and facts about the
business live scattered across notes apps, docs, spreadsheets, and the
founder's head. BusinessOS gives those facts one home, organized around the
questions that actually matter (market, problem, customer, offer,
validation, cash), so that:

- The founder always has an up-to-date, structured view of where the
  business stands.
- AI agents can read that context to give grounded help, and write back
  updates, proposals, or research — without a bespoke integration per agent.
- Decisions and their rationale are durable and versioned, not lost in a
  chat transcript.

## Stack at a glance

- **Next.js** (App Router, TypeScript) — the web app.
- **Content storage: Supabase (Postgres).** All reads and writes go
  through `lib/content.ts`, which queries a single `content_items` table
  server-side (via a service-role key, never exposed to the browser). The
  original `content/**/*.md` files remain in the repo as historical/seed
  data — see `scripts/seed-supabase.ts` — but are no longer read at
  runtime.
- **shadcn/ui** for UI components.
- **Storybook** for building and documenting components in isolation.

## Design philosophy

Minimalist, black & white only (no color palette beyond grays). **Inter**
as the sole typeface. Generous rounded corners throughout. Content is
organized as **cards**, not tables — cards are the primary unit for
displaying and editing a piece of business content. The sidebar highlights
the active/hovered item with a background fill.

## Non-goals for this phase

- **No authentication.** Single implicit user, no login flow — Supabase
  access is via a server-only service-role key, not user auth.
- **No multi-user support.** No sharing, roles, or permissions.
- **No live agent orchestration UI, and no filesystem-based agent
  integration surface anymore.** Earlier drafts of this doc described
  `content/**/*.md` as the integration point for agents/skills; that
  premise is retired now that Supabase is the live data source and no
  agent ever actually used the filesystem surface. A future agent
  integration would read/write Supabase directly. A dedicated UI for
  managing which agents run against which content is still future work
  (see PRD.md roadmap).

See `PRD.md` for product requirements and `SPEC.md` for the technical
specification that the app should be built against.
