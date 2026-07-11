export type Section = "fundador" | "direcao" | "validacao" | "caixa";

export type ContentStatus = "draft" | "in_progress" | "validated" | "stale";

export interface Frontmatter {
  title: string;
  section: Section;
  slug: string;
  summary: string;
  status: ContentStatus;
  updated_at: string; // ISO 8601 string
  related?: string[]; // "section/slug" entries
  tags?: string[];
}

export interface ContentItem {
  frontmatter: Frontmatter;
  body: string; // raw markdown, frontmatter stripped
  filePath: string; // path relative to content/, e.g. "direcao/oferta.md"
}
