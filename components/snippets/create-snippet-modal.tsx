"use client";

import { useState, useTransition, type KeyboardEvent, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, X, Plus, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSnippet, type CreateSnippetInput } from "@/app/actions/snippets";
import { AttachmentDropzone, type QueuedAttachmentFile } from "@/components/attachments/attachment-dropzone";
import { uploadAttachmentFilesToSnippet } from "@/lib/attachments/client";
import { CodeEditor } from "./code-editor";
import { normalizeSnippetTag, SNIPPET_LANGUAGE_OPTIONS, detectLanguage, getSnippetLanguageLabel } from "./snippet-config";

interface CreateSnippetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  title?: string;
  code?: string;
  general?: string;
}

function getAttachmentProgressMessage(step: "prepare" | "upload" | "save" | "complete", fileName: string, index: number, total: number) {
  const prefix = total > 1 ? `Attachment ${index}/${total}` : "Attachment";

  switch (step) {
    case "prepare":
      return `${prefix}: preparing ${fileName}`;
    case "upload":
      return `${prefix}: uploading ${fileName}`;
    case "save":
      return `${prefix}: saving ${fileName}`;
    case "complete":
    default:
      return `${prefix}: saved ${fileName}`;
  }
}

export function CreateSnippetModal({ open, onOpenChange }: CreateSnippetModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const attachmentId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [code, setCode] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [queuedAttachments, setQueuedAttachments] = useState<QueuedAttachmentFile[]>([]);
  const [attachmentStatus, setAttachmentStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (code.trim() && language === "plaintext") {
      const timer = setTimeout(() => {
        const detected = detectLanguage(code);
        if (detected !== "plaintext") {
          setLanguage(detected);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [code, language]);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNotes("");
    setLanguage("plaintext");
    setCode("");
    setTagInput("");
    setTags([]);
    setIsAddingTag(false);
    setQueuedAttachments([]);
    setAttachmentStatus(null);
    setErrors({});
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
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

  const handleSave = () => {
    setErrors({});

    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    if (!code.trim()) {
      setErrors({ code: "Code is required" });
      return;
    }

    startTransition(async () => {
      const input: CreateSnippetInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        language,
        code: code.trim(),
        tags,
      };

      const result = await createSnippet(input);

      if (result.success && result.snippetId) {
        if (queuedAttachments.length > 0) {
          const uploadResult = await uploadAttachmentFilesToSnippet(
            result.snippetId,
            queuedAttachments.map((item) => item.file),
            (progress) => {
              setAttachmentStatus(getAttachmentProgressMessage(
                progress.step,
                progress.fileName,
                progress.index,
                progress.total,
              ));
            },
          );

          if (uploadResult.failures.length > 0) {
            setErrors({
              general: `Snippet saved, but some attachments failed: ${uploadResult.failures.map((failure) => failure.fileName).join(", ")}`,
            });
            router.push(`/snippets/${result.snippetId}`);
            return;
          }
        }

        router.push(`/snippets/${result.snippetId}`);
        return;
      }

      setErrors({ general: result.error ?? "Failed to create snippet" });
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-slim px-6 py-6 sm:px-8 sm:py-8">
        <DialogTitle className="sr-only">Create snippet</DialogTitle>
        {errors.general && (
          <div
            role="alert"
            className="border border-destructive/30 bg-destructive/14 px-4 py-3 text-sm text-destructive rounded-md mb-4"
          >
            {errors.general}
          </div>
        )}

        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              {/* Notion-style editable title */}
              <input
                aria-label="Snippet title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((e) => ({ ...e, title: undefined }));
                  }
                }}
                placeholder="Untitled"
                className="w-full bg-transparent text-xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:bg-muted/30 hover:bg-muted/20 rounded px-1 -mx-1 transition-colors cursor-text"
              />
            </div>
            {/* Language dropdown in header */}
            <Select value={language} onValueChange={(value) => setLanguage(value ?? "plaintext")}>
              <SelectTrigger className="h-7 w-auto min-w-[100px] bg-transparent border border-border-subtle px-2 py-0 text-xs hover:bg-muted/30 rounded focus:ring-0 focus:ring-offset-0">
                <span className="text-xs">{getSnippetLanguageLabel(language)}</span>
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

          {/* Description - editable with minimal styling */}
          <input
            aria-label="Snippet description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-muted/30 hover:bg-muted/20 rounded px-1 -mx-1 transition-colors cursor-text mt-1"
          />
          {errors.title && (
            <p className="text-[11px] text-destructive mt-1">{errors.title}</p>
          )}
        </DialogHeader>

          <div className="space-y-4">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5 items-center">
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
          </div>

          {/* Code editor */}
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Code</p>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              placeholder="Paste your code here..."
              height={300}
            />
            {errors.code && (
              <p className="text-[11px] text-destructive">{errors.code}</p>
            )}
          </div>

          <AttachmentDropzone
            title="Snippet attachments"
            description="Drop files here now. We will save the snippet first, then attach these files automatically."
            disabled={isPending}
            files={queuedAttachments}
            onError={(message) => {
              setAttachmentStatus(null);
              setErrors((current) => ({ ...current, general: message ?? undefined }));
            }}
            onFilesSelected={(files) => {
              setErrors((current) => ({ ...current, general: undefined }));
              setAttachmentStatus(null);
              setQueuedAttachments((current) => [
                ...current,
                ...files.map((file, index) => ({
                  id: `${attachmentId}-${current.length + index}-${file.name}`,
                  file,
                })),
              ]);
            }}
            onRemoveFile={(id) => {
              setQueuedAttachments((current) => current.filter((file) => file.id !== id));
            }}
          />

          {attachmentStatus ? (
            <p className="text-sm text-muted-foreground" role="status">
              {attachmentStatus}
            </p>
          ) : null}

          {/* Notes - Notion-style minimal textarea */}
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

          {/* Actions - bottom right */}
          <div className="flex justify-end items-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
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
      </DialogContent>
    </Dialog>
  );
}
