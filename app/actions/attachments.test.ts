import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Attachment } from "@/lib/db";
import type { PendingAttachmentUploadRecord } from "@/lib/storage/types";

const { mockAuth, mockRevalidatePath } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const { mockSqliteModule } = vi.hoisted(() => ({
  mockSqliteModule: {
    getSnippetById: vi.fn(),
    listSnippets: vi.fn(),
    getSnippetTags: vi.fn(),
    getUserTags: vi.fn(),
    createSnippet: vi.fn(),
    updateSnippet: vi.fn(),
    deleteSnippet: vi.fn(),
    listAttachments: vi.fn(),
    getAttachmentById: vi.fn(),
    saveAttachment: vi.fn(),
    savePendingAttachmentUpload: vi.fn(),
    getPendingAttachmentUpload: vi.fn(),
    deletePendingAttachmentUpload: vi.fn(),
    storeAttachmentBinary: vi.fn(),
    deleteAttachment: vi.fn(),
    getAttachmentDownloadTarget: vi.fn(),
  },
}));

vi.mock("@/lib/storage/sqlite", () => mockSqliteModule);

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  getAttachments,
  getPresignedUploadUrl,
  saveAttachmentMetadata,
} from "../actions/attachments";

function createStorageHarness() {
  const snippets = new Map<string, { id: string; userId: string }>();
  const pendingUploads = new Map<string, PendingAttachmentUploadRecord>();
  const attachments = new Map<string, Attachment>();

  mockSqliteModule.getSnippetById.mockImplementation(async (userId: string, snippetId: string) => {
    const snippet = snippets.get(snippetId);

    if (!snippet || snippet.userId !== userId) {
      return null;
    }

    return {
      id: snippetId,
      user_id: userId,
      title: "Test snippet",
      description: null,
      notes: null,
      language: "typescript",
      code: "const ok = true;",
      search_text: "test snippet",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
    };
  });

  mockSqliteModule.createSnippet.mockImplementation(async (input) => ({ id: input.id }));
  mockSqliteModule.updateSnippet.mockImplementation(async () => false);
  mockSqliteModule.deleteSnippet.mockImplementation(async () => false);

  mockSqliteModule.listAttachments.mockImplementation(async (userId: string, snippetId: string) => {
    const snippet = snippets.get(snippetId);

    if (!snippet || snippet.userId !== userId) {
      return [];
    }

    return [...attachments.values()].filter((attachment) => attachment.snippet_id === snippetId);
  });

  mockSqliteModule.getAttachmentById.mockImplementation(async (userId: string, attachmentId: string) => {
    const attachment = attachments.get(attachmentId);

    if (!attachment) {
      return null;
    }

    const snippet = snippets.get(attachment.snippet_id);
    return snippet?.userId === userId ? attachment : null;
  });

  mockSqliteModule.saveAttachment.mockImplementation(async (input) => {
    const attachment: Attachment = {
      id: input.id,
      snippet_id: input.snippetId,
      storage_key: input.storageKey,
      file_name: input.fileName,
      file_size: input.fileSize,
      mime_type: input.mimeType,
      created_at: new Date().toISOString(),
    };

    attachments.set(attachment.id, attachment);
    return attachment;
  });

  mockSqliteModule.savePendingAttachmentUpload.mockImplementation(async (input) => {
    pendingUploads.set(input.fileId, input);
  });

  mockSqliteModule.getPendingAttachmentUpload.mockImplementation(async (userId: string, fileId: string) => {
    const upload = pendingUploads.get(fileId);
    return upload?.userId === userId ? upload : null;
  });

  mockSqliteModule.deletePendingAttachmentUpload.mockImplementation(async (_userId: string, fileId: string) => {
    pendingUploads.delete(fileId);
  });

  mockSqliteModule.storeAttachmentBinary.mockImplementation(async () => undefined);

  mockSqliteModule.deleteAttachment.mockImplementation(async (userId: string, attachmentId: string) => {
    const attachment = attachments.get(attachmentId);

    if (!attachment) {
      return false;
    }

    const snippet = snippets.get(attachment.snippet_id);

    if (snippet?.userId !== userId) {
      return false;
    }

    attachments.delete(attachmentId);
    return true;
  });

  mockSqliteModule.getAttachmentDownloadTarget.mockImplementation(async (userId: string, attachmentId: string) => {
    const attachment = attachments.get(attachmentId);

    if (!attachment) {
      return null;
    }

    const snippet = snippets.get(attachment.snippet_id);

    if (snippet?.userId !== userId) {
      return null;
    }

    return {
      kind: "blob",
      fileName: attachment.file_name,
      mimeType: attachment.mime_type,
      contentBase64: Buffer.from(`content:${attachment.file_name}`).toString("base64"),
    };
  });

  return {
    seedSnippet(userId: string, snippetId: string) {
      snippets.set(snippetId, { id: snippetId, userId });
    },
  };
}

describe("Attachment Server Actions", () => {
  let storage: ReturnType<typeof createStorageHarness>;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = createStorageHarness();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated upload preparation", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "test.png",
      fileSize: 1024,
      mimeType: "image/png",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("must be signed in");
  });

  it("rejects invalid file types", async () => {
    storage.seedSnippet("user-123", "snippet-1");
    mockAuth.mockResolvedValue({ user: { id: "user-123", email: "test@example.com" } });

    const result = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "virus.exe",
      fileSize: 1024,
      mimeType: "application/x-msdownload",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("not allowed");
  });

  it("creates local upload URL for owned snippet", async () => {
    storage.seedSnippet("user-123", "snippet-1");
    mockAuth.mockResolvedValue({ user: { id: "user-123", email: "test@example.com" } });

    const result = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "test image.png",
      fileSize: 1024,
      mimeType: "image/png",
    });

    expect(result).toEqual({
      success: true,
      uploadUrl: expect.stringContaining("/api/attachments/upload/"),
      storageKey: expect.stringContaining("users/user-123/snippets/snippet-1/"),
      fileId: expect.any(String),
    });
  });

  it("saves attachment metadata after prepared upload", async () => {
    storage.seedSnippet("user-123", "snippet-1");
    mockAuth.mockResolvedValue({ user: { id: "user-123", email: "test@example.com" } });

    const prepared = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "note.md",
      fileSize: 128,
      mimeType: "text/markdown",
    });

    const result = await saveAttachmentMetadata({
      snippetId: "snippet-1",
      storageKey: prepared.storageKey ?? "",
      fileName: "note.md",
      fileSize: 128,
      mimeType: "text/markdown",
      fileId: prepared.fileId ?? "",
    });

    expect(result.success).toBe(true);
    expect(result.attachment?.file_name).toBe("note.md");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/snippets/snippet-1");
  });

  it("returns local download URL for owned attachment", async () => {
    storage.seedSnippet("user-A", "snippet-1");
    mockAuth.mockResolvedValue({ user: { id: "user-A", email: "user-a@example.com" } });

    const prepared = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "test.png",
      fileSize: 1024,
      mimeType: "image/png",
    });
    const saved = await saveAttachmentMetadata({
      snippetId: "snippet-1",
      storageKey: prepared.storageKey ?? "",
      fileName: "test.png",
      fileSize: 1024,
      mimeType: "image/png",
      fileId: prepared.fileId ?? "",
    });

    const result = await getAttachmentDownloadUrl(saved.attachment?.id ?? "");

    expect(result).toEqual({
      success: true,
      url: `http://localhost:3000/api/attachments/download/${saved.attachment?.id}`,
    });
  });

  it("enforces attachment ownership for download and list", async () => {
    storage.seedSnippet("user-A", "snippet-1");
    mockAuth.mockResolvedValue({ user: { id: "user-A", email: "user-a@example.com" } });

    const prepared = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "test.png",
      fileSize: 1024,
      mimeType: "image/png",
    });
    const saved = await saveAttachmentMetadata({
      snippetId: "snippet-1",
      storageKey: prepared.storageKey ?? "",
      fileName: "test.png",
      fileSize: 1024,
      mimeType: "image/png",
      fileId: prepared.fileId ?? "",
    });

    mockAuth.mockResolvedValue({ user: { id: "user-B", email: "user-b@example.com" } });

    const downloadResult = await getAttachmentDownloadUrl(saved.attachment?.id ?? "");
    const listResult = await getAttachments("snippet-1");
    const deleteResult = await deleteAttachment(saved.attachment?.id ?? "");

    expect(downloadResult.success).toBe(false);
    expect(downloadResult.error).toContain("Attachment not found");
    expect(listResult).toEqual({ success: true, attachments: [] });
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain("Attachment not found");
  });
});
