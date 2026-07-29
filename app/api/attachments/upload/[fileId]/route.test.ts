import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockAuth, mockSqliteModule } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockSqliteModule: {
    getPendingAttachmentUpload: vi.fn(),
    storeAttachmentBinary: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/storage/sqlite", () => mockSqliteModule);

describe("local attachment upload route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("stores attachment bytes through the active backend using server-issued upload state", async () => {
    mockSqliteModule.storeAttachmentBinary.mockResolvedValue(undefined);
    mockSqliteModule.getPendingAttachmentUpload.mockResolvedValue({
      fileId: "file-1",
      userId: "user-1",
      snippetId: "snippet-1",
      storageKey: "users/user-1/snippets/snippet-1/file-1-notes.md",
      fileName: "notes.md",
      fileSize: 5,
      mimeType: "text/markdown",
      expiresAt: "2026-03-30T00:05:00.000Z",
    });

    const { PUT } = await import("@/app/api/attachments/upload/[fileId]/route");
    const request = new NextRequest(
      "http://localhost:3000/api/attachments/upload/file-1",
      {
        method: "PUT",
        body: "hello",
        headers: {
          "content-type": "text/markdown",
        },
      }
    );

    const response = await PUT(request, {
      params: Promise.resolve({ fileId: "file-1" }),
    });

    expect(response.status).toBe(200);
    expect(mockSqliteModule.getPendingAttachmentUpload).toHaveBeenCalledWith("user-1", "file-1");
    expect(mockSqliteModule.storeAttachmentBinary).toHaveBeenCalledWith(
      "user-1",
      "file-1",
      "users/user-1/snippets/snippet-1/file-1-notes.md",
      expect.any(Uint8Array)
    );
  });

  it("rejects uploads without a matching pending upload record", async () => {
    mockSqliteModule.getPendingAttachmentUpload.mockResolvedValue(null);
    mockSqliteModule.storeAttachmentBinary.mockResolvedValue(undefined);

    const { PUT } = await import("@/app/api/attachments/upload/[fileId]/route");
    const request = new NextRequest("http://localhost:3000/api/attachments/upload/file-1", {
      method: "PUT",
      body: "hello",
      headers: {
        "content-type": "text/markdown",
      },
    });

    const response = await PUT(request, {
      params: Promise.resolve({ fileId: "file-1" }),
    });

    expect(response.status).toBe(404);
  });
});
