"use server";

import { revalidatePath } from "next/cache";
import { Effect } from "effect";
import type { Attachment } from "@/lib/db";
import {
  deleteAttachment as deleteAttachmentRecord,
  getAttachmentDownload,
  listSnippetAttachments,
  prepareUpload,
  saveAttachment,
} from "@/lib/core/services/attachments";
import {
  createActionFailure,
  requireUserIdEffect,
  runServerAction,
  tryPromiseEffect,
} from "@/lib/effect/server-actions";

export interface GetPresignedUrlInput {
  snippetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface GetPresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  storageKey?: string;
  fileId?: string;
  error?: string;
}

export interface SaveAttachmentInput {
  snippetId: string;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileId: string;
}

export interface SaveAttachmentResult {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}

export interface DeleteAttachmentResult {
  success: boolean;
  error?: string;
}

export interface GetAttachmentsResult {
  success: boolean;
  attachments?: Attachment[];
  error?: string;
}

export interface GetAttachmentUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function getPresignedUploadUrl(
  input: GetPresignedUrlInput
): Promise<GetPresignedUrlResult> {
  return runServerAction<
    Awaited<ReturnType<typeof prepareUpload>>,
    unknown,
    GetPresignedUrlResult
  >({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to upload files");
      return yield* tryPromiseEffect(() => prepareUpload({ userId }, input));
    }),
    onSuccess: (result) => ({
      success: true,
      uploadUrl: result.uploadUrl,
      storageKey: result.storageKey,
      fileId: result.fileId,
    }),
    onFailure: (error) => createActionFailure(error, "Failed to generate upload URL"),
  });
}

export async function saveAttachmentMetadata(
  input: SaveAttachmentInput
): Promise<SaveAttachmentResult> {
  return runServerAction<Attachment, unknown, SaveAttachmentResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to manage attachments");
      const attachment = yield* tryPromiseEffect(() => saveAttachment({ userId }, input));

      yield* Effect.sync(() => {
        revalidatePath(`/snippets/${input.snippetId}`);
      });

      return attachment;
    }),
    onSuccess: (attachment) => ({ success: true, attachment }),
    onFailure: (error) => createActionFailure(error, "Failed to save attachment metadata"),
  });
}

export async function getAttachments(snippetId: string): Promise<GetAttachmentsResult> {
  return runServerAction<Attachment[], unknown, GetAttachmentsResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to manage attachments");
      return yield* tryPromiseEffect(() => listSnippetAttachments({ userId }, snippetId));
    }),
    onSuccess: (attachments) => ({ success: true, attachments }),
    onFailure: (error) => createActionFailure(error, "Failed to fetch attachments"),
  });
}

export async function getAttachmentDownloadUrl(
  attachmentId: string
): Promise<GetAttachmentUrlResult> {
  return runServerAction<string, unknown, GetAttachmentUrlResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to download files");
      const target = yield* tryPromiseEffect(() => getAttachmentDownload({ userId }, attachmentId));

      if (target.kind === "blob" && target.contentBase64) {
        return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/attachments/download/${attachmentId}`;
      }

      return yield* Effect.fail(new Error("Failed to generate download URL"));
    }),
    onSuccess: (url) => ({ success: true, url }),
    onFailure: (error) => createActionFailure(error, "Failed to generate download URL"),
  });
}

export async function deleteAttachment(
  attachmentId: string
): Promise<DeleteAttachmentResult> {
  return runServerAction<
    Awaited<ReturnType<typeof deleteAttachmentRecord>>,
    unknown,
    DeleteAttachmentResult
  >({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to manage attachments");
      const result = yield* tryPromiseEffect(() => deleteAttachmentRecord({ userId }, attachmentId));

      if (result.snippetId) {
        yield* Effect.sync(() => {
          revalidatePath(`/snippets/${result.snippetId}`);
        });
      }

      return result;
    }),
    onSuccess: () => ({ success: true }),
    onFailure: (error) => createActionFailure(error, "Failed to delete attachment"),
  });
}
