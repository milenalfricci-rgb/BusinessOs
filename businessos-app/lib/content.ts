import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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

function contentRoot(): string {
  return path.join(process.cwd(), "content");
}

function filePathFor(section: Section, slug: string): string {
  return path.join(contentRoot(), section, `${slug}.md`);
}

/**
 * Validate a raw parsed frontmatter object against the schema in SPEC.md §3,
 * cross-checking `section`/`slug` against the file's actual on-disk location.
 * Throws a descriptive error on any failure.
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
      `Frontmatter/path mismatch in "${relativeFilePath}": frontmatter "section" is "${raw.section}" but file lives under "${expectedSection}/".`
    );
  }

  if (typeof raw.slug !== "string" || raw.slug.trim() === "") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or empty required field "slug".`
    );
  }
  if (raw.slug !== expectedSlug) {
    throw new Error(
      `Frontmatter/path mismatch in "${relativeFilePath}": frontmatter "slug" is "${raw.slug}" but filename implies "${expectedSlug}".`
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

  // YAML auto-detects unquoted ISO 8601 scalars (e.g. `2026-07-11T14:30:00.000Z`)
  // as native Date objects rather than strings. SPEC.md §3.1's own example
  // writes `updated_at` unquoted, so normalize a parsed Date back to an ISO
  // string instead of rejecting it.
  let updatedAt = raw.updated_at;
  if (updatedAt instanceof Date) {
    updatedAt = updatedAt.toISOString();
  }

  if (typeof updatedAt !== "string" || updatedAt.trim() === "") {
    throw new Error(
      `Invalid frontmatter in "${relativeFilePath}": missing or invalid required field "updated_at".`
    );
  }

  if (raw.related !== undefined) {
    if (
      !Array.isArray(raw.related) ||
      !raw.related.every((entry) => typeof entry === "string")
    ) {
      throw new Error(
        `Invalid frontmatter in "${relativeFilePath}": "related" must be an array of strings when present.`
      );
    }
  }

  if (raw.tags !== undefined) {
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
    related: raw.related as string[] | undefined,
    tags: raw.tags as string[] | undefined,
  };
}

function readContentItem(section: Section, slug: string): ContentItem {
  const absPath = filePathFor(section, slug);
  const relativeFilePath = path.join(section, `${slug}.md`).replace(/\\/g, "/");

  if (!fs.existsSync(absPath)) {
    throw new Error(
      `Content file not found: "content/${relativeFilePath}" (section="${section}", slug="${slug}").`
    );
  }

  const raw = fs.readFileSync(absPath, "utf-8");
  const parsed = matter(raw);
  const frontmatter = validateFrontmatter(
    parsed.data as Record<string, unknown>,
    section,
    slug,
    relativeFilePath
  );

  return {
    frontmatter,
    body: parsed.content.replace(/^\n+/, "").replace(/\s+$/, "\n"),
    filePath: relativeFilePath,
  };
}

// Read every item in a section, in the fixed display order defined for
// that section (see PRD.md §4.2 / SPEC.md §2 for the canonical order).
// Throws if the section itself is invalid; returns [] only if the section
// folder exists but is empty (should not happen given the fixed item set).
export function listSection(section: Section): ContentItem[] {
  assertValidSection(section);

  const slugs = SECTION_ITEMS[section];
  const sectionDir = path.join(contentRoot(), section);

  if (!fs.existsSync(sectionDir)) {
    return [];
  }

  return slugs.map((slug) => readContentItem(section, slug));
}

// Read a single item. Throws a descriptive error if the file does not
// exist or fails frontmatter validation (missing required field, wrong
// `section`/`slug` value vs. the file's actual location, etc).
export function getContentItem(section: Section, slug: string): ContentItem {
  assertValidSection(section);
  return readContentItem(section, slug);
}

// Partial update: merge `data.frontmatter` into the existing frontmatter
// (shallow merge — arrays like `related`/`tags` are replaced wholesale,
// not merged element-by-element), replace `body` if provided, and
// ALWAYS overwrite `updated_at` to the current time on any call,
// regardless of whether frontmatter was passed. Writes the file back to
// disk atomically (write to a temp file, then rename) using `gray-matter`
// to re-serialize. Returns nothing; callers re-fetch via
// getContentItem/listSection to get the fresh state.
export function updateContentItem(
  section: Section,
  slug: string,
  data: { frontmatter?: Partial<Frontmatter>; body?: string }
): void {
  assertValidSection(section);

  const existing = readContentItem(section, slug);

  const mergedFrontmatter: Frontmatter = {
    ...existing.frontmatter,
    ...data.frontmatter,
    updated_at: new Date().toISOString(),
  };

  const relativeFilePath = path.join(section, `${slug}.md`).replace(/\\/g, "/");
  // Re-validate the merged result so a bad partial update (e.g. an invalid
  // status enum value) fails loudly instead of writing corrupt content.
  validateFrontmatter(
    mergedFrontmatter as unknown as Record<string, unknown>,
    section,
    slug,
    relativeFilePath
  );

  const nextBody = data.body !== undefined ? data.body : existing.body;

  const fileContents = matter.stringify(nextBody, mergedFrontmatter);

  const absPath = filePathFor(section, slug);
  const tmpPath = path.join(
    path.dirname(absPath),
    `.${slug}.md.${process.pid}.${Date.now()}.tmp`
  );

  fs.writeFileSync(tmpPath, fileContents, "utf-8");
  fs.renameSync(tmpPath, absPath);
}
