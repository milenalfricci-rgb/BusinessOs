"use client";

import * as React from "react";

import { saveContentItem } from "@/app/actions/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContentItem, ContentStatus } from "@/lib/content.types";
import { cn } from "@/lib/utils";

export type ContentCardMode = "grid" | "list";

export interface ContentCardProps {
  item: ContentItem;
  mode: ContentCardMode;
  className?: string;
}

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  validated: "Validated",
  stale: "Stale",
};

const STATUS_VARIANT: Record<
  ContentStatus,
  "outline" | "secondary" | "default" | "destructive"
> = {
  draft: "outline",
  in_progress: "secondary",
  validated: "default",
  stale: "destructive",
};

const STATUS_OPTIONS: ContentStatus[] = [
  "draft",
  "in_progress",
  "validated",
  "stale",
];

function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="shrink-0">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// tags/related are edited as a single comma-separated text field; these
// convert between that and the string[] shape stored in frontmatter.
function formatListField(values: string[] | undefined): string {
  return (values ?? []).join(", ");
}

function parseListField(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Renders a single ContentItem as either a grid tile or a full-width list
 * row (SPEC.md §6.5). Both modes read the same `item` prop — no separate
 * fetching per mode. Clicking the card opens an edit-in-place dialog
 * (PRD.md §4.5) that writes back through the `saveContentItem` Server
 * Action.
 */
export function ContentCard({ item, mode, className }: ContentCardProps) {
  const [open, setOpen] = React.useState(false);
  const { frontmatter } = item;

  const handleOpen = () => setOpen(true);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <>
      {mode === "grid" ? (
        <Card
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className={cn(
            "cursor-pointer transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{frontmatter.title}</CardTitle>
              <StatusBadge status={frontmatter.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {frontmatter.summary}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className={cn(
            "cursor-pointer transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className
          )}
        >
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:w-64 sm:shrink-0">
              <h3 className="truncate font-medium">{frontmatter.title}</h3>
              <StatusBadge status={frontmatter.status} />
            </div>
            <p className="truncate text-sm text-muted-foreground sm:flex-1">
              {frontmatter.summary}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatUpdatedAt(frontmatter.updated_at)}
            </span>
          </div>
        </Card>
      )}

      <ContentCardEditDialog item={item} open={open} onOpenChange={setOpen} />
    </>
  );
}

interface ContentCardEditDialogProps {
  item: ContentItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ContentCardEditDialog({
  item,
  open,
  onOpenChange,
}: ContentCardEditDialogProps) {
  const [title, setTitle] = React.useState(item.frontmatter.title);
  const [summary, setSummary] = React.useState(item.frontmatter.summary);
  const [status, setStatus] = React.useState<ContentStatus>(
    item.frontmatter.status
  );
  const [tags, setTags] = React.useState(
    formatListField(item.frontmatter.tags)
  );
  const [related, setRelated] = React.useState(
    formatListField(item.frontmatter.related)
  );
  const [body, setBody] = React.useState(item.body);
  const [isPending, startTransition] = React.useTransition();

  // Reset the form to the latest saved item whenever the dialog is
  // (re)opened, so stale in-progress edits from a previous open don't leak.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the form to the latest saved item each time the dialog (re)opens
      setTitle(item.frontmatter.title);
      setSummary(item.frontmatter.summary);
      setStatus(item.frontmatter.status);
      setTags(formatListField(item.frontmatter.tags));
      setRelated(formatListField(item.frontmatter.related));
      setBody(item.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item.filePath]);

  function handleSave() {
    startTransition(async () => {
      await saveContentItem(item.frontmatter.section, item.frontmatter.slug, {
        frontmatter: {
          title,
          summary,
          status,
          tags: parseListField(tags),
          related: parseListField(related),
        },
        body,
      });
      onOpenChange(false);
    });
  }

  const idPrefix = item.filePath.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {item.frontmatter.title}</DialogTitle>
          <DialogDescription>content/{item.filePath}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-title`}>Title</Label>
            <Input
              id={`${idPrefix}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-summary`}>Summary</Label>
            <Input
              id={`${idPrefix}-summary`}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-status`}>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ContentStatus)}
              disabled={isPending}
            >
              <SelectTrigger id={`${idPrefix}-status`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {STATUS_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
            <Input
              id={`${idPrefix}-tags`}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="comma-separated, e.g. pricing, growth"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-related`}>Related</Label>
            <Input
              id={`${idPrefix}-related`}
              value={related}
              onChange={(event) => setRelated(event.target.value)}
              placeholder="comma-separated section/slug, e.g. direcao/oferta"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-body`}>Body</Label>
            <Textarea
              id={`${idPrefix}-body`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={12}
              className="font-mono text-sm"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
