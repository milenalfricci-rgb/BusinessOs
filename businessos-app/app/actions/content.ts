"use server";

import { revalidatePath } from "next/cache";
import { updateContentItem } from "@/lib/content";
import type { Frontmatter, Section } from "@/lib/content.types";

export async function saveContentItem(
  section: Section,
  slug: string,
  data: { frontmatter?: Partial<Frontmatter>; body?: string }
): Promise<void> {
  updateContentItem(section, slug, data);
  revalidatePath(`/${section}`);
}
