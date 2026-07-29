"use client";

import { useId, useState, type DragEvent } from "react";
import { FileText, UploadSimple, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  formatAttachmentFileSize,
  validateAttachmentFile,
} from "@/lib/attachments/shared";
import { cn } from "@/lib/utils";

export interface QueuedAttachmentFile {
  id: string;
  file: File;
}

interface AttachmentDropzoneProps {
  description?: string;
  disabled?: boolean;
  files: QueuedAttachmentFile[];
  onError?: (message: string | null) => void;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile?: (id: string) => void;
  title?: string;
}

function extractValidFiles(fileList: FileList | null, onError?: (message: string | null) => void) {
  const files = Array.from(fileList ?? []);
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    const validationError = validateAttachmentFile({ size: file.size, type: file.type });

    if (validationError) {
      errors.push(`${file.name}: ${validationError}`);
      return;
    }

    validFiles.push(file);
  });

  onError?.(errors[0] ?? null);

  return validFiles;
}

export function AttachmentDropzone({
  title = "Add attachments",
  description = "Drag files here or click to browse. Images, PDFs, text, and code files up to 5 MB.",
  disabled = false,
  files,
  onFilesSelected,
  onRemoveFile,
  onError,
}: AttachmentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  const handleFiles = (fileList: FileList | null) => {
    const validFiles = extractValidFiles(fileList, onError);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input
        id={inputId}
        type="file"
        multiple
        accept={ALLOWED_ATTACHMENT_MIME_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      <label
        htmlFor={inputId}
        aria-label={title}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "block rounded-xl border border-dashed border-border-subtle bg-muted/30 p-4 transition-colors",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-border hover:bg-muted/40",
          isDragging ? "border-primary bg-primary/5" : null,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-card px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground">
            <UploadSimple className="size-4" weight="bold" aria-hidden="true" />
            Click or drop files
          </div>
        </div>
      </label>

      {files.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border-subtle bg-muted/20 p-3">
          {files.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-card px-3 py-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-muted/40 text-muted-foreground">
                <FileText className="size-4" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {formatAttachmentFileSize(item.file.size)}
                </p>
              </div>

              {onRemoveFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => onRemoveFile(item.id)}
                  disabled={disabled}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
