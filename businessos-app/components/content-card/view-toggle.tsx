"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ViewMode = "grid" | "list";

export interface ViewToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  className?: string;
}

/**
 * A shadcn <Select> with two options, "grid" and "list" (SPEC.md §6.6).
 * Purely controlled — the parent section page owns the state and is
 * responsible for persisting/restoring it (e.g. via localStorage).
 */
export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as ViewMode)}
    >
      <SelectTrigger className={className ?? "w-[120px]"} aria-label="View mode">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="grid">Grid</SelectItem>
        <SelectItem value="list">List</SelectItem>
      </SelectContent>
    </Select>
  );
}
