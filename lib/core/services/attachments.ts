import type { CacheContext } from "@/lib/core/context";
import { CacheError, createNotFoundError, createValidationError } from "@/lib/core/errors";
import type {
  AttachmentDownloadTarget,
  PendingAttachmentUploadRecord,
} from "@/lib/storage/types";
import * as sqlite from "@/lib/storage/sqlite";
import { generateStorageKey, sanitizeFilename, validateFile } from "@/lib/attachments/storage";

export interface PrepareAttachmentInput {
  snippetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface SaveAttachmentInput {
  snippetId: string;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileId: string;
}

export interface UploadAttachmentInput extends PrepareAttachmentInput {
  content: Uint8Array;
}

const PENDING_UPLOAD_TTL_MS = 10 * 60 * 1000;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function createLocalAttachmentReference(userId: string, snippetId: string, fileName: string) {
  const fileId = crypto.randomUUID();
  const storageKey = `users/${userId}/snippets/${snippetId}/${fileId}-${sanitizeFilename(fileName)}`;

  return {
    fileId,
    storageKey,
    uploadUrl: `${getAppUrl()}/api/attachments/upload/${fileId}`,
  };
}

function createPendingUploadRecord(
  context: CacheContext,
  input: PrepareAttachmentInput,
  reference: { fileId: string; storageKey: string }
): PendingAttachmentUploadRecord {
  return {
    fileId: reference.fileId,
    userId: context.userId,
    snippetId: input.snippetId,
    storageKey: reference.storageKey,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    expiresAt: new Date(Date.now() + PENDING_UPLOAD_TTL_MS).toISOString(),
  };
}

function assertPendingUploadMatches(input: SaveAttachmentInput, pendingUpload: PendingAttachmentUploadRecord) {
  if (pendingUpload.snippetId !== input.snippetId) {
    throw createValidationError("Upload metadata does not match pending upload");
  }

  if (pendingUpload.storageKey !== input.storageKey) {
    throw createValidationError("Upload metadata does not match pending upload");
  }

  if (pendingUpload.fileName !== input.fileName) {
    throw createValidationError("Upload metadata does not match pending upload");
  }

  if (pendingUpload.fileSize !== input.fileSize) {
    throw createValidationError("Upload metadata does not match pending upload");
  }

  if (pendingUpload.mimeType !== input.mimeType) {
    throw createValidationError("Upload metadata does not match pending upload");
  }
}

async function requireSnippet(context: CacheContext, snippetId: string) {
  const snippet = await sqlite.getSnippetById(context.userId, snippetId);

  if (!snippet) {
    throw createNotFoundError("Snippet not found");
  }
}

function validateAttachment(input: PrepareAttachmentInput) {
  const validationError = validateFile({
    size: input.fileSize,
    type: input.mimeType,
  });

  if (validationError) {
    throw createValidationError(validationError);
  }
}

export async function prepareUpload(context: CacheContext, input: PrepareAttachmentInput) {
  validateAttachment(input);
  await requireSnippet(context, input.snippetId);
  const reference = createLocalAttachmentReference(context.userId, input.snippetId, input.fileName);

  await sqlite.savePendingAttachmentUpload(createPendingUploadRecord(context, input, reference));

  return reference;
}

export async function saveAttachment(context: CacheContext, input: SaveAttachmentInput) {
  await requireSnippet(context, input.snippetId);
  const pendingUpload = await sqlite.getPendingAttachmentUpload(context.userId, input.fileId);

  if (!pendingUpload) {
    throw createNotFoundError("Upload session not found or expired");
  }

  assertPendingUploadMatches(input, pendingUpload);

  if (new Date(pendingUpload.expiresAt).getTime() <= Date.now()) {
    await sqlite.deletePendingAttachmentUpload(context.userId, input.fileId);
    throw createNotFoundError("Upload session not found or expired");
  }

  const attachment = await sqlite.saveAttachment({
    id: input.fileId,
    snippetId: pendingUpload.snippetId,
    userId: context.userId,
    storageKey: pendingUpload.storageKey,
    fileName: pendingUpload.fileName,
    fileSize: pendingUpload.fileSize,
    mimeType: pendingUpload.mimeType,
  });

  await sqlite.deletePendingAttachmentUpload(context.userId, input.fileId);

  return attachment;
}

export async function listSnippetAttachments(context: CacheContext, snippetId: string) {
  return sqlite.listAttachments(context.userId, snippetId);
}

export async function getAttachmentDownload(
  context: CacheContext,
  attachmentId: string
): Promise<AttachmentDownloadTarget> {
  const target = await sqlite.getAttachmentDownloadTarget(context.userId, attachmentId);

  if (!target) {
    throw createNotFoundError("Attachment not found");
  }

  if (target.kind === "blob" && target.contentBase64) {
    return target;
  }

  throw new CacheError("internal_error", "Failed to load attachment content", 500);
}

export async function deleteAttachment(context: CacheContext, attachmentId: string) {
  const [attachment, deleted] = await Promise.all([
    sqlite.getAttachmentById(context.userId, attachmentId),
    sqlite.deleteAttachment(context.userId, attachmentId),
  ]);

  if (!deleted) {
    throw createNotFoundError("Attachment not found");
  }

  return { success: true, snippetId: attachment?.snippet_id ?? null };
}

export async function uploadAttachment(context: CacheContext, input: UploadAttachmentInput) {
  validateAttachment(input);

  await requireSnippet(context, input.snippetId);
  const fileId = crypto.randomUUID();
  const storageKey = generateStorageKey(context.userId, input.snippetId, fileId, input.fileName);

  await sqlite.storeAttachmentBinary(
    context.userId,
    fileId,
    storageKey,
    input.content
  );

  return sqlite.saveAttachment({
    id: fileId,
    snippetId: input.snippetId,
    userId: context.userId,
    storageKey,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
  });
}
