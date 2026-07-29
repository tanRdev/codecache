"use client";

import Image from "next/image";
import { Suspense, use, useRef, useState, useTransition } from "react";
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
import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  getAttachments,
  getPresignedUploadUrl,
  saveAttachmentMetadata,
} from "@/app/actions/attachments";
import type { Attachment } from "@/lib/db";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  canPreviewAttachmentInline,
  validateAttachmentFile,
} from "@/lib/attachments/shared";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowSquareOut, CircleNotch, FileText, Image as ImageIcon, Trash, UploadSimple } from "@phosphor-icons/react";

const shellClassName =
  "rounded-lg border border-border-subtle bg-card p-5 text-foreground sm:p-6";

const rowClassName =
  "rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 transition-colors duration-150 ease-out hover:border-border hover:bg-surface-secondary";

interface AttachmentUploadProps {
  onUploadComplete?: () => void;
  snippetId: string;
}

export function AttachmentUpload({ snippetId, onUploadComplete }: AttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setUploadProgress("Validating file...");

    const validationError = validateAttachmentFile(file);
    if (validationError) {
      setError(validationError);
      setUploadProgress("");
      resetInput();
      return;
    }

    setIsUploading(true);
    setUploadProgress("Getting upload URL...");

    try {
      const presignedResult = await getPresignedUploadUrl({
        snippetId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if (!presignedResult.success || !presignedResult.uploadUrl || !presignedResult.storageKey || !presignedResult.fileId) {
        setError(presignedResult.error || "Failed to get upload URL");
        return;
      }

      setUploadProgress("Uploading file...");

      const uploadResponse = await fetch(presignedResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        setError("Failed to upload file. Please try again.");
        return;
      }

      setUploadProgress("Saving metadata...");

      const saveResult = await saveAttachmentMetadata({
        snippetId,
        storageKey: presignedResult.storageKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileId: presignedResult.fileId,
      });

      if (!saveResult.success) {
        setError(saveResult.error || "Failed to save attachment metadata");
        return;
      }

      setUploadProgress("Upload complete!");
      resetInput();
      onUploadComplete?.();
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <section className={cn(shellClassName, "space-y-5")}>
      <div className="space-y-2 border-b border-border-subtle pb-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-primary">Attachments</p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Upload reference files</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Keep screenshots, PDFs, notes, and supporting code next to the snippet they explain.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_ATTACHMENT_MIME_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className="rounded-2xl border border-dashed border-border bg-surface-primary p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
              accepted formats
            </p>
            <p className="text-sm leading-6 text-muted-foreground">Max 5 MB · images, PDF, text, code</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-card px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors duration-150 ease-out hover:border-border-accent hover:bg-surface-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-50"
          >
            {isUploading ? <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden="true" /> : <UploadSimple className="size-4" weight="bold" aria-hidden="true" />}
            {isUploading ? uploadProgress || "Uploading..." : "Upload file"}
          </button>
        </div>

        {uploadProgress && !error ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground" role="status">
            {uploadProgress}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-destructive/28 bg-destructive/12 px-4 py-3 text-sm text-foreground">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

interface AttachmentListProps {
  attachments: Attachment[];
}

const EMPTY_ATTACHMENTS: Attachment[] = [];

function createImagePreviewRequest(attachmentId: string) {
  return getAttachmentDownloadUrl(attachmentId)
    .then((result) => {
      if (result.success && result.url) {
        return result.url;
      }

      return null;
    })
    .catch(() => null);
}

function getAttachmentViewUrl(attachmentId: string) {
  return `/api/attachments/download/${encodeURIComponent(attachmentId)}`;
}

function ImagePreview({ attachment, onDelete }: { attachment: Attachment; onDelete: (id: string) => void }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previewRequest] = useState(() => createImagePreviewRequest(attachment.id));
  const canPreview = canPreviewAttachmentInline(attachment.mime_type);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAttachment(attachment.id);
      if (result.success) {
        onDelete(attachment.id);
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface-primary">
      <div className="relative aspect-video border-b border-border-subtle bg-background">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <CircleNotch className="size-6 animate-spin text-text-tertiary" weight="bold" aria-hidden="true" />
            </div>
          }
        >
          <ImagePreviewMedia attachment={attachment} previewRequest={previewRequest} />
        </Suspense>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-100 transition-[background-color,opacity] duration-150 ease-out [@media(hover:hover)]:bg-black/60 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
          <a
            href={getAttachmentViewUrl(attachment.id)}
            target={canPreview ? "_blank" : undefined}
            rel={canPreview ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-black transition-colors duration-150 ease-out hover:bg-white"
          >
            {canPreview ? (
              <ArrowSquareOut className="size-3.5" weight="bold" aria-hidden="true" />
            ) : (
              <ArrowDown className="size-3.5" weight="bold" aria-hidden="true" />
            )}
            {canPreview ? "View" : "Download"}
          </a>

          <DeleteAttachmentButton
            attachment={attachment}
            deleteDialogOpen={deleteDialogOpen}
            isPending={isPending}
            onConfirm={handleDelete}
            onOpenChange={setDeleteDialogOpen}
            triggerClassName="inline-flex items-center gap-2 rounded-lg border border-destructive/26 bg-destructive/90 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-150 ease-out hover:bg-destructive disabled:pointer-events-none disabled:opacity-50"
            triggerLabel="Delete"
          />
        </div>
      </div>

      <div className="space-y-1 px-4 py-3">
        <p className="truncate text-sm font-semibold text-foreground" title={attachment.file_name}>
          {attachment.file_name}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
    </article>
  );
}

function ImagePreviewMedia({
  attachment,
  previewRequest,
}: {
  attachment: Attachment;
  previewRequest: Promise<string | null>;
}) {
  const imageUrl = use(previewRequest);

  if (!imageUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-text-tertiary">
        <ImageIcon className="size-5" weight="regular" aria-hidden="true" />
        <p className="text-[11px] uppercase tracking-[0.18em]">preview unavailable</p>
      </div>
    );
  }

  return <Image src={imageUrl} alt={attachment.file_name} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-contain" />;
}

function FileCard({ attachment, onDelete }: { attachment: Attachment; onDelete: (id: string) => void }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canPreview = canPreviewAttachmentInline(attachment.mime_type);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAttachment(attachment.id);
      if (result.success) {
        onDelete(attachment.id);
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <article className={cn(rowClassName, "flex items-center gap-3")}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-black/20 text-text-tertiary">
        <FileText className="size-4" weight="regular" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-semibold text-foreground" title={attachment.file_name}>
          {attachment.file_name}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
          {getFileExtension(attachment.file_name)} · {formatFileSize(attachment.file_size)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href={getAttachmentViewUrl(attachment.id)}
          target={canPreview ? "_blank" : undefined}
          rel={canPreview ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-150 ease-out hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {canPreview ? (
            <ArrowSquareOut className="size-3.5" weight="bold" aria-hidden="true" />
          ) : (
            <ArrowDown className="size-3.5" weight="bold" aria-hidden="true" />
          )}
          {canPreview ? "View" : "Download"}
        </a>

        <DeleteAttachmentButton
          attachment={attachment}
          deleteDialogOpen={deleteDialogOpen}
          isPending={isPending}
          onConfirm={handleDelete}
          onOpenChange={setDeleteDialogOpen}
          triggerClassName="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-150 ease-out hover:border-destructive/26 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-50"
          triggerLabel="Delete"
        />
      </div>
    </article>
  );
}

function DeleteAttachmentButton({
  attachment,
  deleteDialogOpen,
  isPending,
  onConfirm,
  onOpenChange,
  triggerClassName,
  triggerLabel,
}: {
  attachment: Attachment;
  deleteDialogOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  triggerClassName: string;
  triggerLabel: string;
}) {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger
        render={
          <button type="button" disabled={isPending} className={triggerClassName} aria-label={`Delete ${attachment.file_name}`}>
            <Trash className="size-3.5" weight="regular" aria-hidden="true" />
            {triggerLabel}
          </button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{attachment.file_name}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const deletedAttachmentIdSet = new Set(deletedAttachmentIds);

  const visibleAttachments = attachments.filter(
    (attachment) => !deletedAttachmentIdSet.has(attachment.id)
  );

  const handleDelete = (attachmentId: string) => {
    setDeletedAttachmentIds((currentIds) => {
      if (currentIds.includes(attachmentId)) {
        return currentIds;
      }

      return [...currentIds, attachmentId];
    });
  };

  if (visibleAttachments.length === 0) {
    return null;
  }

  const images = visibleAttachments.filter((attachment) => attachment.mime_type.startsWith("image/"));
  const otherFiles = visibleAttachments.filter(
    (attachment) => !attachment.mime_type.startsWith("image/")
  );

  return (
    <section className={cn(shellClassName, "space-y-6")}>
      <div className="space-y-2 border-b border-border-subtle pb-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-primary">Stored attachments</p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Attachment inventory</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Review uploaded files, view safe formats, download active formats, or remove them.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
            Images
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((attachment) => (
              <ImagePreview key={attachment.id} attachment={attachment} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ) : null}

      {otherFiles.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
            Files
          </h3>
          <div className="space-y-3">
            {otherFiles.map((attachment) => (
              <FileCard key={attachment.id} attachment={attachment} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

interface AttachmentsPanelProps {
  initialAttachments?: Attachment[];
  snippetId: string;
}

export function AttachmentsPanel({ snippetId, initialAttachments = EMPTY_ATTACHMENTS }: AttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);

  const visibleAttachments = attachments ?? initialAttachments ?? EMPTY_ATTACHMENTS;

  const refreshAttachments = async () => {
    const result = await getAttachments(snippetId);
    if (result.success && result.attachments) {
      setAttachments(result.attachments);
    }
  };

  return (
    <div className="space-y-6">
      <AttachmentUpload snippetId={snippetId} onUploadComplete={refreshAttachments} />
      <AttachmentList attachments={visibleAttachments} />
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.at(-1)?.toUpperCase() ?? "FILE" : "FILE";
}
