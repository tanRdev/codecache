"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleNotch,
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CodeBlock } from "./code-block";
import { CodeEditor } from "./code-editor";
import {
  deleteSnippet,
  updateSnippet,
  type UpdateSnippetInput,
} from "@/app/actions/snippets";
import type { SnippetRecord } from "@/lib/storage/types";
import { cn } from "@/lib/utils";
import {
  getSnippetLanguageLabel,
  normalizeSnippetTag,
  SNIPPET_LANGUAGE_OPTIONS,
} from "./snippet-config";
import { StorageBadge } from "@/components/storage-badge";
import { AttachmentsPanel } from "@/components/attachments/attachment-upload";
import type { StorageBackend } from "@/lib/storage/types";
import type { Attachment } from "@/lib/db";

const EMPTY_ATTACHMENTS: Attachment[] = [];

interface SnippetDetailProps {
  initialAttachments?: Attachment[];
  snippet: SnippetRecord;
  storageBackend?: StorageBackend;
}

const sectionClassName =
  "border border-border bg-card px-6 py-6 md:px-7";

const labelClassName =
  "text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

export function SnippetDetail({
  snippet,
  storageBackend,
  initialAttachments = EMPTY_ATTACHMENTS,
}: SnippetDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(snippet.title);
  const [description, setDescription] = useState(snippet.description ?? "");
  const [notes, setNotes] = useState(snippet.notes ?? "");
  const [language, setLanguage] = useState(snippet.language);
  const [code, setCode] = useState(snippet.code);
  const [tags, setTags] = useState<string[]>(snippet.tags);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const languageLabel = getSnippetLanguageLabel(snippet.language);
  const createdDate = formatSnippetDate(snippet.created_at);
  const updatedDate = formatSnippetDate(snippet.updated_at);

  const resetForm = () => {
    setTitle(snippet.title);
    setDescription(snippet.description ?? "");
    setNotes(snippet.notes ?? "");
    setLanguage(snippet.language);
    setCode(snippet.code);
    setTags(snippet.tags);
    setTagInput("");
    setError(null);
  };

  const addTag = () => {
    const normalizedTag = normalizeSnippetTag(tagInput);

    if (!normalizedTag || tags.includes(normalizedTag)) {
      return;
    }

    setTags((currentTags) => [...currentTags, normalizedTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addTag();
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditMode(false);
  };

  const handleSave = () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!language.trim()) {
      setError("Language is required");
      return;
    }

    if (!code.trim()) {
      setError("Code is required");
      return;
    }

    startTransition(async () => {
      const input: UpdateSnippetInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        language,
        code: code.trim(),
        tags,
      };

      const result: { success: boolean; error?: string } = await updateSnippet(snippet.id, input);

      if (!result.success) {
        setError(result.error ?? "Failed to update snippet");
        return;
      }

      setIsEditMode(false);

      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result: { success: boolean; error?: string } = await deleteSnippet(snippet.id);

      if (!result.success) {
        setError(result.error ?? "Failed to delete snippet");
        setDeleteDialogOpen(false);
        return;
      }

      router.push("/dashboard");
    });
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to library
        </Link>

        {error ? (
          <div
            role="alert"
            className="border border-destructive/30 bg-destructive/14 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <section className={cn(sectionClassName, "space-y-6")}>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Edit snippet</p>
            <h2 className="text-2xl font-medium tracking-tight text-foreground">Refine the snippet</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Update the source, retune the metadata, and keep the usage notes current.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <label htmlFor="title" className={labelClassName}>
                  Title <span className="text-primary">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-12 bg-muted/40 px-4 text-sm"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="description" className={labelClassName}>
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="min-h-24 bg-muted/40 px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-2.5">
                <label htmlFor="notes" className={labelClassName}>
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={6}
                  className="min-h-36 bg-muted/40 px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-5 border border-border bg-background/70 p-4">
              <div className="space-y-2.5">
                <label htmlFor="language" className={labelClassName}>
                  Language <span className="text-primary">*</span>
                </label>
                <Select value={language} onValueChange={(value) => setLanguage(value ?? "")}>
                  <SelectTrigger id="language" className="h-12 w-full bg-muted/40 px-4 text-sm">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SNIPPET_LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="tags" className={labelClassName}>
                  Tags
                </label>
                <div className="flex gap-3">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag"
                    className="h-12 bg-muted/40 px-4 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addTag}
                    disabled={!normalizeSnippetTag(tagInput)}
                    aria-label="Add tag"
                    className="size-12"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex min-h-11 flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="h-7 border-border-subtle bg-white/[0.03] px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <div className="flex min-h-11 items-center border border-dashed border-border px-4 text-sm text-muted-foreground">
                      No tags yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className={labelClassName}>
              Code <span className="text-primary">*</span>
            </p>
            <CodeEditor value={code} onChange={setCode} language={language || "plaintext"} height={420} />
          </div>

          <div className="flex flex-col gap-3 border-t border-border-subtle pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Changes update this snippet across the browser, CLI, and API.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleCancelEdit} disabled={isPending} className="h-11 px-4">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="h-11 px-5">
                {isPending ? (
                  <>
                    <CircleNotch className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="border border-destructive/30 bg-destructive/14 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <section className={cn(sectionClassName, "space-y-6")}>
        <div className="flex flex-col gap-5 border-b border-border-subtle pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to library
            </Link>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-border-accent bg-[var(--accent-primary-soft)] px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
                  {languageLabel}
                </span>
                {storageBackend ? <StorageBadge backend={storageBackend} /> : null}
                <span className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
                  {snippet.tags.length} {snippet.tags.length === 1 ? "tag" : "tags"}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                  {snippet.title}
                </h1>
                {snippet.description ? (
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                    {snippet.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {snippet.tags.length > 0 ? (
                  snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border-subtle bg-surface-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-tertiary"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
                    Untagged
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              onClick={() => setIsEditMode(true)}
              disabled={isPending}
              className="h-10 px-4"
            >
              <PencilSimple className="mr-2 size-4" />
              Edit
            </Button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" disabled={isPending} aria-label="Delete snippet" className="size-10">
                    <Trash className="size-4" />
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{snippet.title}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isPending ? (
                      <>
                        <CircleNotch className="mr-2 size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-4 text-[11px] uppercase tracking-[0.18em] text-text-tertiary md:grid-cols-3">
          <div className="border border-border-subtle bg-surface-primary px-4 py-3">
            <p>Created</p>
            <p className="mt-2 text-sm tracking-normal text-muted-foreground">{createdDate}</p>
          </div>
          <div className="border border-border-subtle bg-surface-primary px-4 py-3">
            <p>Updated</p>
            <p className="mt-2 text-sm tracking-normal text-muted-foreground">{updatedDate}</p>
          </div>
          <div className="border border-border-subtle bg-surface-primary px-4 py-3">
            <p>Characters</p>
            <p className="mt-2 text-sm tracking-normal text-muted-foreground">{snippet.code.length.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className={cn(sectionClassName, "space-y-4")}>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Source</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Code surface</h2>
        </div>
        <CodeBlock code={snippet.code} language={snippet.language} />
      </section>

      <section className={cn(sectionClassName, "space-y-4")}>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Notes</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage notes</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep the caveats, reminders, and implementation context next to the source.
          </p>
        </div>
        <div className="border border-border-subtle bg-surface-primary p-4 md:p-5">
          {snippet.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{snippet.notes}</p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              No notes yet. Add usage reminders or edge cases from edit mode.
            </p>
          )}
        </div>
      </section>

      <AttachmentsPanel snippetId={snippet.id} initialAttachments={initialAttachments} />
    </div>
  );
}

function formatSnippetDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
