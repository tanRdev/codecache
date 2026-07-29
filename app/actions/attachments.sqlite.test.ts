import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/storage/sqlite", () => ({
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
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("attachment actions for sqlite", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });

    const sqlite = await import("@/lib/storage/sqlite");
    vi.mocked(sqlite.getSnippetById).mockResolvedValue({
      id: "snippet-1",
      user_id: "user-1",
      title: "Snippet",
      description: null,
      notes: null,
      language: "typescript",
      code: "const ok = true;",
      search_text: "snippet",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
    });
    vi.mocked(sqlite.savePendingAttachmentUpload).mockResolvedValue(undefined);
    vi.mocked(sqlite.getAttachmentDownloadTarget).mockResolvedValue({
      kind: "blob",
      fileName: "notes.md",
      mimeType: "text/markdown",
      contentBase64: Buffer.from("hello").toString("base64"),
    });

    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("returns local upload URL", async () => {
    const { getPresignedUploadUrl } = await import("./attachments");

    const result = await getPresignedUploadUrl({
      snippetId: "snippet-1",
      fileName: "notes.md",
      fileSize: 128,
      mimeType: "text/markdown",
    });

    expect(result).toEqual({
      success: true,
      fileId: expect.any(String),
      storageKey: expect.stringContaining("users/user-1/snippets/snippet-1/"),
      uploadUrl: expect.stringContaining("/api/attachments/upload/"),
    });
  });

  it("returns local download route for blob attachment", async () => {
    const { getAttachmentDownloadUrl } = await import("./attachments");
    const result = await getAttachmentDownloadUrl("attachment-1");

    expect(result).toEqual({
      success: true,
      url: "http://localhost:3000/api/attachments/download/attachment-1",
    });
  });
});
