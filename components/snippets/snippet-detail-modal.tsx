"use client";

import { useState, useTransition, useEffect, useRef, type KeyboardEvent } from "react";
import { CircleNotch, PencilSimple, Plus, Trash, X, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CodeBlock } from "./code-block";
import { CodeEditor } from "./code-editor";
import { getSnippet, deleteSnippet, updateSnippet, type UpdateSnippetInput } from "@/app/actions/snippets";
import {
  getSnippetLanguageLabel,
  normalizeSnippetTag,
  SNIPPET_LANGUAGE_OPTIONS,
} from "./snippet-config";
import { AttachmentDropzone, type QueuedAttachmentFile } from "@/components/attachments/attachment-dropzone";
import { uploadAttachmentFilesToSnippet } from "@/lib/attachments/client";
import { AttachmentList } from "@/components/attachments/attachment-upload";
import { getAttachments } from "@/app/actions/attachments";

interface SnippetDetailModalProps {
  snippetId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SnippetDetailModal({
  snippetId,
  open,
  onOpenChange,
  onDeleted,
}: SnippetDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [snippet, setSnippet] = useState<{
    id: string;
    title: string;
    description: string | null;
    notes: string | null;
    language: string;
    code: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  } | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    snippet_id: string;
    storage_key: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
  }>>([]);
  const [queuedAttachments, setQueuedAttachments] = useState<QueuedAttachmentFile[]>([]);
  const [attachmentStatus, setAttachmentStatus] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    if (!snippetId || !open) {
      return;
    }

    startTransition(async () => {
      const result = await getAttachments(snippetId);

      if (cancelled || !result.success || !result.attachments) {
        return;
      }

      setAttachments(result.attachments);
    });

    return () => {
      cancelled = true;
    };
  }, [snippetId, open]);

  useEffect(() => {
    let cancelled = false;

    if (snippetId && open) {
      startTransition(async () => {
        const result = await getSnippet(snippetId);
        if (cancelled) return;

        if (result.success && result.snippet) {
          setSnippet(result.snippet);
          setTitle(result.snippet.title);
          setDescription(result.snippet.description ?? "");
          setNotes(result.snippet.notes ?? "");
          setLanguage(result.snippet.language);
          setCode(result.snippet.code);
          setTags(result.snippet.tags);
          setError(null);
          setIsEditMode(false);
          setIsAddingTag(false);
        } else {
          setError(result.error ?? "Failed to load snippet");
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [snippetId, open]);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const resetForm = () => {
    if (snippet) {
      setTitle(snippet.title);
      setDescription(snippet.description ?? "");
      setNotes(snippet.notes ?? "");
      setLanguage(snippet.language);
      setCode(snippet.code);
      setTags(snippet.tags);
    }
    setTagInput("");
    setError(null);
    setIsAddingTag(false);
  };

  const addTag = () => {
    const normalizedTag = normalizeSnippetTag(tagInput);
    if (!normalizedTag || tags.includes(normalizedTag)) {
      setTagInput("");
      setIsAddingTag(false);
      return;
    }
    setTags((currentTags) => [...currentTags, normalizedTag]);
    setTagInput("");
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addTag();
  };

  const handleCancelEdit = () => {
    resetForm();
    setQueuedAttachments([]);
    setAttachmentStatus(null);
    setIsEditMode(false);
  };

  const refreshAttachments = async (nextSnippetId: string) => {
    const result = await getAttachments(nextSnippetId);

    if (result.success && result.attachments) {
      setAttachments(result.attachments);
    }
  };

  const handleAttachmentSelection = async (files: File[]) => {
    if (!snippet) {
      return;
    }

    setQueuedAttachments(files.map((file, index) => ({ id: `${snippet.id}-${index}-${file.name}`, file })));
    setAttachmentStatus(null);

    const uploadResult = await uploadAttachmentFilesToSnippet(snippet.id, files, (progress) => {
      const prefix = progress.total > 1 ? `Attachment ${progress.index}/${progress.total}` : "Attachment";
      const action = progress.step === "prepare"
        ? "preparing"
        : progress.step === "upload"
          ? "uploading"
          : progress.step === "save"
            ? "saving"
            : "saved";
      setAttachmentStatus(`${prefix}: ${action} ${progress.fileName}`);
    });

    if (uploadResult.failures.length > 0) {
      setError(`Some attachments failed: ${uploadResult.failures.map((failure) => failure.fileName).join(", ")}`);
    } else {
      setQueuedAttachments([]);
      await refreshAttachments(snippet.id);
    }
  };

  const handleSave = () => {
    if (!snippet) return;
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

      const result = await updateSnippet(snippet.id, input);

      if (!result.success) {
        setError(result.error ?? "Failed to update snippet");
        return;
      }

      setSnippet((prev) =>
        prev
          ? {
              ...prev,
              title: title.trim(),
              description: description.trim() || null,
              notes: notes.trim() || null,
              language,
              code: code.trim(),
              tags,
              updated_at: new Date().toISOString(),
            }
          : null
      );
      setIsEditMode(false);
      setIsAddingTag(false);
    });
  };

  const handleDelete = () => {
    if (!snippet) return;

    startTransition(async () => {
      const result = await deleteSnippet(snippet.id);

      if (!result.success) {
        setError(result.error ?? "Failed to delete snippet");
        setDeleteDialogOpen(false);
        return;
      }

      onOpenChange(false);
      onDeleted?.();
    });
  };

  const handleClose = () => {
    if (isEditMode) {
      resetForm();
      setIsEditMode(false);
    }
    onOpenChange(false);
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  if (!snippetId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-slim px-6 py-6 sm:px-8 sm:py-8">
        {isPending && !snippet ? (
          <div className="flex items-center justify-center py-12">
            <CircleNotch className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error && !snippet ? (
          <div className="py-8 text-center text-sm text-muted-foreground">{error}</div>
        ) : snippet ? (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <div className="flex-1 space-y-1">
                    {/* Notion-style editable title - looks like text, minimal styling */}
                    <input
                      aria-label="Snippet title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled"
                      className="w-full bg-transparent text-xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:bg-muted/30 hover:bg-muted/20 rounded px-1 -mx-1 transition-colors cursor-text"
                    />
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                      {snippet.title}
                    </DialogTitle>
                    <span className="shrink-0 rounded border border-primary/25 bg-primary/8 px-1.5 py-0 text-[10px] uppercase tracking-[0.14em] text-primary/80">
                      {getSnippetLanguageLabel(snippet.language)}
                    </span>
                  </>
                )}
              </div>

              {/* Description - editable in edit mode with minimal styling */}
              {isEditMode ? (
                <input
                  aria-label="Snippet description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-muted/30 hover:bg-muted/20 rounded px-1 -mx-1 transition-colors cursor-text mt-1"
                />
              ) : snippet.description ? (
                <p className="text-sm text-muted-foreground mt-2">{snippet.description}</p>
              ) : null}
            </DialogHeader>

            {error ? (
              <div
                role="alert"
                className="border border-destructive/30 bg-destructive/14 px-4 py-3 text-sm text-destructive rounded-md"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              {/* Meta row: date and char count */}
              {!isEditMode && (
                <p className="text-[11px] text-text-tertiary">
                  {formatDate(snippet.created_at)} · {snippet.code.length.toLocaleString()} chars
                  {snippet.created_at !== snippet.updated_at && (
                    <> · edited {formatDate(snippet.updated_at)}</>
                  )}
                </p>
              )}

              {/* Tags and Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {isEditMode ? (
                    <>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded border border-border-subtle bg-white/[0.02] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-text-secondary"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-text-tertiary transition-colors hover:text-destructive"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                      {isAddingTag ? (
                        <Input
                          ref={tagInputRef}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          onBlur={() => {
                            if (!tagInput.trim()) {
                              setIsAddingTag(false);
                            }
                          }}
                          placeholder="Type and press Enter"
                          className="h-7 w-40 text-[10px] uppercase tracking-[0.14em] bg-muted/40 px-2 py-0.5 rounded-md"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingTag(true)}
                          className="inline-flex items-center gap-1 rounded border border-dashed border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-text-tertiary hover:text-text-secondary hover:border-text-secondary transition-colors"
                          aria-label="Add tag"
                        >
                          <Plus className="size-3" />
                          Add tag
                        </button>
                      )}
                    </>
                  ) : (
                    snippet.tags.length > 0 && (
                      snippet.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-border-subtle bg-white/[0.02] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-text-tertiary"
                        >
                          {tag}
                        </span>
                      ))
                    )
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!isEditMode && (
                    <>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={isPending}
                          aria-label="Delete snippet"
                          className="size-7 rounded-md text-text-tertiary hover:text-destructive"
                        >
                          <Trash aria-hidden="true" className="size-4" />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{snippet.title}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEnterEditMode}
                        disabled={isPending}
                        className="gap-1.5 rounded-md"
                      >
                        <PencilSimple className="size-4" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Language selector and actions in edit mode */}
              {isEditMode && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Language</span>
                    <Select value={language} onValueChange={(v) => setLanguage(v ?? "")}>
                      <SelectTrigger className="h-7 w-auto min-w-[100px] bg-transparent border-0 px-2 py-0 text-xs hover:bg-muted/30 rounded focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SNIPPET_LANGUAGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="gap-1.5 rounded-md"
                    >
                      <X className="size-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isPending}
                      className="gap-1.5 rounded-md"
                    >
                      {isPending ? (
                        <CircleNotch className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Code block - editable in edit mode */}
              {isEditMode ? (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Code</p>
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={language || "plaintext"}
                    height={300}
                  />
                </div>
              ) : (
                <CodeBlock code={snippet.code} language={snippet.language} />
              )}

              {/* Notes - editable in edit mode with Notion-style minimal textarea */}
              {isEditMode ? (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Notes</p>
                  <textarea
                    aria-label="Snippet notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full bg-transparent text-sm text-text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:bg-muted/30 hover:bg-muted/20 rounded px-2 py-2 -mx-2 transition-colors resize-none border-0"
                  />
                </div>
              ) : (
                snippet.notes && (
                  <div className="border border-border-subtle bg-white/[0.02] p-4 rounded-md">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{snippet.notes}</p>
                  </div>
                )
              )}

              <div className="space-y-3">
                <AttachmentDropzone
                  title="Snippet attachments"
                  description={isEditMode
                    ? "Drop files here to upload them to this snippet now."
                    : "Open edit mode to add files to this snippet from the modal."}
                  disabled={!isEditMode || isPending}
                  files={queuedAttachments}
                  onError={(message) => setError(message)}
                  onFilesSelected={(files) => {
                    void handleAttachmentSelection(files);
                  }}
                  onRemoveFile={isEditMode ? (id) => {
                    setQueuedAttachments((current) => current.filter((file) => file.id !== id));
                  } : undefined}
                />

                {attachmentStatus ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    {attachmentStatus}
                  </p>
                ) : null}

                <AttachmentList attachments={attachments} />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
