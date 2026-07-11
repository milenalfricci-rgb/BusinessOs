"use client";

import * as React from "react";

import { ContentCard } from "@/components/content-card/content-card";
import { ViewToggle, type ViewMode } from "@/components/content-card/view-toggle";
import type { ContentItem, Section } from "@/lib/content.types";
import { cn } from "@/lib/utils";

export interface SectionPageProps {
  /** Section slug — used to namespace the persisted view-mode preference. */
  section: Section;
  /** Human-facing heading, e.g. "Fundador". */
  title: string;
  /** Items to render, already in the fixed display order for the section. */
  items: ContentItem[];
}

function storageKey(section: Section): string {
  return `businessos:view-mode:${section}`;
}

function isViewMode(value: string | null): value is ViewMode {
  return value === "grid" || value === "list";
}

/**
 * Shared section-page layout (SPEC.md §6.5/§6.6): a heading, the
 * grid/list ViewToggle, and the section's ContentItems rendered in the
 * selected mode. Owns the view-mode state and persists it to
 * localStorage under `businessos:view-mode:<section>`, restoring it on
 * mount.
 */
export function SectionPage({ section, title, items }: SectionPageProps) {
  const [mode, setMode] = React.useState<ViewMode>("grid");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // One-time restore from localStorage on mount: this value isn't
    // available during SSR, so it can't be read during initial render —
    // an effect is the correct place to sync it in.
    const stored = window.localStorage.getItem(storageKey(section));
    if (isViewMode(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing one-time from an external store (localStorage) unavailable at render time
      setMode(stored);
    }
    setHydrated(true);
  }, [section]);

  const handleModeChange = React.useCallback(
    (next: ViewMode) => {
      setMode(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey(section), next);
      }
    },
    [section]
  );

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <ViewToggle value={mode} onValueChange={handleModeChange} />
      </div>

      {/* Avoid a flash of the wrong mode before localStorage is read. */}
      <div className={cn(hydrated ? "opacity-100" : "opacity-0")}>
        {mode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <ContentCard key={item.filePath} item={item} mode="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ContentCard key={item.filePath} item={item} mode="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
