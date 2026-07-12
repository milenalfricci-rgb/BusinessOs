// One-time migration: reads the original content/**/*.md files and
// upserts them into the Supabase `content_items` table. Safe to re-run
// (upsert on the `(section, slug)` unique constraint).
//
// Usage: npx tsx scripts/seed-supabase.ts

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// Not importing lib/supabase.ts here: it's guarded by `server-only`, which
// unconditionally throws outside a Next.js server build (this script runs
// as plain Node via tsx), so this script builds its own client directly.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SECTION_ITEMS: Record<string, string[]> = {
  fundador: ["objetivo", "estilo-de-vida"],
  direcao: [
    "mapa-do-mercado",
    "mapa-de-problemas",
    "perfil-ideal-de-cliente",
    "tese-de-valor",
    "oferta",
  ],
  validacao: ["oferta", "primeiros-clientes"],
  caixa: ["fluxo-de-caixa", "erp"],
};

async function main() {
  const contentRoot = path.join(process.cwd(), "content");
  const rows: Record<string, unknown>[] = [];

  for (const [section, slugs] of Object.entries(SECTION_ITEMS)) {
    for (const slug of slugs) {
      const filePath = path.join(contentRoot, section, `${slug}.md`);
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = matter(raw);
      const fm = parsed.data as Record<string, unknown>;

      const updatedAt =
        fm.updated_at instanceof Date ? fm.updated_at.toISOString() : fm.updated_at;

      rows.push({
        section,
        slug,
        title: fm.title,
        summary: fm.summary,
        status: fm.status,
        updated_at: updatedAt,
        related: fm.related ?? null,
        tags: fm.tags ?? null,
        body: parsed.content.replace(/^\n+/, "").replace(/\s+$/, "\n"),
      });
    }
  }

  const { error } = await supabase
    .from("content_items")
    .upsert(rows, { onConflict: "section,slug" });

  if (error) {
    throw new Error(`Seed failed: ${error.message}`);
  }

  console.log(`Seeded ${rows.length} content items into Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
