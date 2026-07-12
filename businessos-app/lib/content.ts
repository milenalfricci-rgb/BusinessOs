import "server-only";
import { supabase } from "./supabase";
import type { ContentItem, ContentStatus, Frontmatter, Section } from "./content.types";

const SECTIONS: Section[] = ["fundador", "direcao", "validacao", "caixa"];
const STATUSES: ContentStatus[] = ["draft", "in_progress", "validated", "stale"];

// Fixed display order per section (see SPEC.md §2 / §5).
const SECTION_ITEMS: Record<Section, string[]> = {
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

function assertValidSection(section: Section): void {
  if (!SECTIONS.includes(section)) {
    throw new Error(
      `Invalid section "${section}". Must be one of: ${SECTIONS.join(", ")}.`
    );
  }
}

/**
 * Validate a raw frontmatter-shaped object against the schema in SPEC.md §3,
 * cross-checking `section`/`slug` against the expected on-disk-style
 * location (`<section>/<slug>.md`, kept as a label for error messages even
 * though there is no real file anymore). Throws a descriptive error on any
 * failure.
 */
function validateFrontmatter(
  raw: Record<string, unknown>,
  expectedSection: Section,
  expectedSlug: string,
  relativeFilePath: string
): Frontmatter {
  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or empty required field "title".`
    );
  }

  if (typeof raw.section !== "string" || !SECTIONS.includes(raw.section as Section)) {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": "section" must be one of ${SECTIONS.join(
        ", "
      )}, got ${JSON.stringify(raw.section)}.`
    );
  }
  if (raw.section !== expectedSection) {
    throw new Error(
      `Frontmatter/path mismatch in "${relativeFilePath}": frontmatter "section" is "${raw.section}" but expected "${expectedSection}".`
    );
  }

  if (typeof raw.slug !== "string" || raw.slug.trim() === "") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or empty required field "slug".`
    );
  }
  if (raw.slug !== expectedSlug) {
    throw new Error(
      `Frontmatter/path mismatch in "${relativeFilePath}": frontmatter "slug" is "${raw.slug}" but expected "${expectedSlug}".`
    );
  }

  if (typeof raw.summary !== "string") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or invalid required field "summary".`
    );
  }

  if (typeof raw.status !== "string" || !STATUSES.includes(raw.status as ContentStatus)) {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": "status" must be one of ${STATUSES.join(
        ", "
      )}, got ${JSON.stringify(raw.status)}.`
    );
  }

  let updatedAt = raw.updated_at;
  if (updatedAt instanceof Date) {
    updatedAt = updatedAt.toISOString();
  }

  if (typeof updatedAt !== "string" || updatedAt.trim() === "") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or invalid required field "updated_at".`
    );
  }

  if (raw.related !== undefined && raw.related !== null) {
    if (
      !Array.isArray(raw.related) ||
      !raw.related.every((entry) => typeof entry === "string")
    ) {
      throw new Error(
        `Invalid frontmatter in "${relativeFilePath}": "related" must be an array of strings when present.`
      );
    }
  }

  if (raw.tags !== undefined && raw.tags !== null) {
    if (!Array.isArray(raw.tags) || !raw.tags.every((entry) => typeof entry === "string")) {
      throw new Error(
        `Invalid frontmatter in "${relativeFilePath}": "tags" must be an array of strings when present.`
      );
    }
  }

  return {
    title: raw.title,
    section: raw.section as Section,
    slug: raw.slug,
    summary: raw.summary,
    status: raw.status as ContentStatus,
    updated_at: updatedAt,
    related: (raw.related ?? undefined) as string[] | undefined,
    tags: (raw.tags ?? undefined) as string[] | undefined,
  };
}

interface ContentItemRow {
  section: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  updated_at: string;
  related: string[] | null;
  tags: string[] | null;
  body: string;
}

function rowToContentItem(row: ContentItemRow): ContentItem {
  const relativeFilePath = `${row.section}/${row.slug}.md`;
  const frontmatter = validateFrontmatter(
    row as unknown as Record<string, unknown>,
    row.section as Section,
    row.slug,
    relativeFilePath
  );
  return {
    frontmatter,
    body: row.body,
    filePath: relativeFilePath,
  };
}

// Read every item in a section, in the fixed display order defined for
// that section (see PRD.md §4.2 / SPEC.md §2 for the canonical order).
// Throws if the section itself is invalid, or if an expected item is
// missing from the database.
export async function listSection(section: Section): Promise<ContentItem[]> {
  assertValidSection(section);

  const slugs = SECTION_ITEMS[section];

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("section", section)
    .in("slug", slugs);

  if (error) {
    throw new Error(`Failed to list section "${section}": ${error.message}`);
  }

  const bySlug = new Map((data as ContentItemRow[]).map((row) => [row.slug, row]));

  return slugs.map((slug) => {
    const row = bySlug.get(slug);
    if (!row) {
      throw new Error(
        `Content item not found: "${section}/${slug}" (expected by SECTION_ITEMS but missing from content_items table).`
      );
    }
    return rowToContentItem(row);
  });
}

// Read a single item. Throws a descriptive error if the row does not exist
// or fails frontmatter validation.
export async function getContentItem(section: Section, slug: string): Promise<ContentItem> {
  assertValidSection(section);

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("section", section)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get content item "${section}/${slug}": ${error.message}`);
  }
  if (!data) {
    throw new Error(
      `Content item not found: "${section}/${slug}" (section="${section}", slug="${slug}").`
    );
  }

  return rowToContentItem(data as ContentItemRow);
}

// Partial update: merge `data.frontmatter` into the existing frontmatter
// (shallow merge — arrays like `related`/`tags` are replaced wholesale,
// not merged element-by-element), replace `body` if provided, and ALWAYS
// overwrite `updated_at` to the current time on any call, regardless of
// whether frontmatter was passed. Updates the row in Supabase (a single
// `UPDATE` is already atomic — no temp-file dance needed). Returns
// nothing; callers re-fetch via getContentItem/listSection to get the
// fresh state.
export async function updateContentItem(
  section: Section,
  slug: string,
  data: { frontmatter?: Partial<Frontmatter>; body?: string }
): Promise<void> {
  assertValidSection(section);

  const existing = await getContentItem(section, slug);

  const mergedFrontmatter: Frontmatter = {
    ...existing.frontmatter,
    ...data.frontmatter,
    updated_at: new Date().toISOString(),
  };

  const relativeFilePath = `${section}/${slug}.md`;
  // Re-validate the merged result so a bad partial update (e.g. an invalid
  // status enum value) fails loudly instead of writing corrupt content.
  validateFrontmatter(
    mergedFrontmatter as unknown as Record<string, unknown>,
    section,
    slug,
    relativeFilePath
  );

  const nextBody = data.body !== undefined ? data.body : existing.body;

  const { error } = await supabase
    .from("content_items")
    .update({
      title: mergedFrontmatter.title,
      summary: mergedFrontmatter.summary,
      status: mergedFrontmatter.status,
      updated_at: mergedFrontmatter.updated_at,
      related: mergedFrontmatter.related ?? null,
      tags: mergedFrontmatter.tags ?? null,
      body: nextBody,
    })
    .eq("section", section)
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to update content item "${section}/${slug}": ${error.message}`);
  }
}
