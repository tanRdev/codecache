"use client";

import { useState, useTransition, type KeyboardEvent, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, Plus, X, FloppyDisk } from "@phosphor-icons/react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createSnippet, type CreateSnippetInput } from "@/app/actions/snippets";
import { uploadAttachmentFilesToSnippet } from "@/lib/attachments/client";
import { AttachmentDropzone, type QueuedAttachmentFile } from "@/components/attachments/attachment-dropzone";
import { CodeEditor } from "./code-editor";
import { normalizeSnippetTag, SNIPPET_LANGUAGE_OPTIONS, detectLanguage, getSnippetLanguageLabel } from "./snippet-config";

interface FormErrors {
  title?: string;
  language?: string;
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

export function CreateSnippetForm() {
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
  const [queuedAttachments, setQueuedAttachments] = useState<QueuedAttachmentFile[]>([]);
  const [attachmentStatus, setAttachmentStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleSave = () => {
    setErrors({});

    if (!code.trim()) {
      setErrors({ code: "Code is required" });
      return;
    }

    if (!title.trim()) {
      setShowDetailsModal(true);
      return;
    }

    submitForm();
  };

  const submitForm = () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
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

      const result: { success: boolean; snippetId?: string; error?: string } = await createSnippet(input);

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
      setShowDetailsModal(false);
    });
  };

  const handleDetailsModalSave = () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    setErrors({});
    setShowDetailsModal(false);
    submitForm();
  };

  return (
    <div className="flex flex-col gap-6">
      {errors.general ? (
        <div
          role="alert"
          className="border border-destructive/30 bg-destructive/14 px-4 py-3 text-sm text-destructive"
        >
          {errors.general}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={(value) => setLanguage(value ?? "plaintext")}>
            <SelectTrigger className="h-10 w-[180px] bg-muted/40 px-3 text-sm">
              <SelectValue placeholder="Language" />
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
        <Button
          onClick={handleSave}
          disabled={isPending || !code.trim()}
          className="h-10 px-4 text-sm gap-2"
        >
          {isPending ? (
            <>
              <CircleNotch className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FloppyDisk className="size-4" />
              Save
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          placeholder="Paste your code here..."
          height="calc(100vh - 280px)"
        />
        {errors.code ? (
          <p className="text-sm text-destructive">{errors.code}</p>
        ) : null}
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

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add snippet details</DialogTitle>
            <DialogDescription>
              Give your snippet a name so you can find it later. Description, notes, and tags are optional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2.5">
              <label htmlFor="modal-title" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Title <span className="text-primary">*</span>
              </label>
              <Input
                id="modal-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (event.target.value.trim()) {
                    setErrors((e) => ({ ...e, title: undefined }));
                  }
                }}
                placeholder="e.g. React state updater pattern"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "modal-title-error" : undefined}
                className="h-12 bg-muted/40 px-4 text-sm"
              />
              {errors.title ? (
                <p id="modal-title-error" className="text-sm text-destructive">
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2.5">
              <label htmlFor="modal-description" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Description
              </label>
              <Textarea
                id="modal-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short summary for scanning the library view..."
                rows={2}
                className="min-h-16 bg-muted/40 px-4 py-3 text-sm"
              />
            </div>

            <div className="space-y-2.5">
              <label htmlFor="modal-notes" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Notes
              </label>
              <Textarea
                id="modal-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Usage notes, edge cases, dependencies..."
                rows={3}
                className="min-h-20 bg-muted/40 px-4 py-3 text-sm"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="modal-tags" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  id="modal-tags"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag and press Enter..."
                  className="h-10 flex-1 bg-muted/40 px-3 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTag}
                  disabled={!normalizeSnippetTag(tagInput)}
                  aria-label="Add tag"
                  className="size-10 shrink-0"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                        className="h-7 border-border-subtle bg-white/[0.03] px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground transition-colors hover:text-destructive ml-1"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border border-border bg-muted/30 px-4 py-3">
              <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Language</p>
              <p className="text-sm text-foreground">{getSnippetLanguageLabel(language)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleDetailsModalSave} disabled={isPending}>
              {isPending ? (
                <>
                  <CircleNotch className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Snippet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
