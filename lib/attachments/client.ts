"use client";

import { getPresignedUploadUrl, saveAttachmentMetadata } from "@/app/actions/attachments";

export interface AttachmentUploadProgress {
  fileName: string;
  index: number;
  total: number;
  step: "prepare" | "upload" | "save" | "complete";
}

export interface AttachmentUploadFailure {
  fileName: string;
  error: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An unexpected error occurred during upload";
}

export async function uploadAttachmentFileToSnippet(
  snippetId: string,
  file: File,
  onProgress?: (progress: AttachmentUploadProgress) => void,
  index = 0,
  total = 1,
) {
  onProgress?.({ fileName: file.name, index, total, step: "prepare" });

  const presignedResult = await getPresignedUploadUrl({
    snippetId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  if (!presignedResult.success || !presignedResult.uploadUrl || !presignedResult.storageKey || !presignedResult.fileId) {
    throw new Error(presignedResult.error || "Failed to get upload URL");
  }

  onProgress?.({ fileName: file.name, index, total, step: "upload" });

  const uploadResponse = await fetch(presignedResult.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file. Please try again.");
  }

  onProgress?.({ fileName: file.name, index, total, step: "save" });

  const saveResult = await saveAttachmentMetadata({
    snippetId,
    storageKey: presignedResult.storageKey,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileId: presignedResult.fileId,
  });

  if (!saveResult.success) {
    throw new Error(saveResult.error || "Failed to save attachment metadata");
  }

  onProgress?.({ fileName: file.name, index, total, step: "complete" });
}

export async function uploadAttachmentFilesToSnippet(
  snippetId: string,
  files: File[],
  onProgress?: (progress: AttachmentUploadProgress) => void,
) {
  const failures: AttachmentUploadFailure[] = [];

  for (const [index, file] of files.entries()) {
    try {
      await uploadAttachmentFileToSnippet(snippetId, file, onProgress, index + 1, files.length);
    } catch (error) {
      failures.push({
        fileName: file.name,
        error: getErrorMessage(error),
      });
    }
  }

  return { failures };
}
