export const MAX_ATTACHMENT_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
] as const;

const INLINE_PREVIEW_MIME_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);

export function canPreviewAttachmentInline(mimeType: string | null | undefined) {
  return Boolean(mimeType && INLINE_PREVIEW_MIME_TYPES.has(mimeType));
}

export function validateAttachmentFile(file: { size: number; type: string }) {
  if (file.size > MAX_ATTACHMENT_FILE_SIZE) {
    return `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number])) {
    return `File type "${file.type}" is not allowed. Allowed types: images, PDFs, text files, and code files.`;
  }

  return null;
}

export function formatAttachmentFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
