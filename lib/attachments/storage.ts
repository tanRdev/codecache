import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_FILE_SIZE,
  validateAttachmentFile,
} from "@/lib/attachments/shared";

export function sanitizeFilename(filename: string): string {
  const baseName = filename.split(/[/\\]/).pop() || filename;
  return baseName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase()
    .slice(0, 200) || "attachment";
}

export function generateStorageKey(
  userId: string,
  snippetId: string,
  fileId: string,
  filename: string
): string {
  const safeName = sanitizeFilename(filename);
  return `users/${userId}/snippets/${snippetId}/${fileId}-${safeName}`;
}

export function validateFile(file: { size: number; type: string }) {
  return validateAttachmentFile(file);
}

export const ATTACHMENT_STORAGE_CONSTANTS = {
  MAX_FILE_SIZE: MAX_ATTACHMENT_FILE_SIZE,
  ALLOWED_MIME_TYPES: ALLOWED_ATTACHMENT_MIME_TYPES,
};
