import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockAuth, mockSqliteModule } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockSqliteModule: {
    getAttachmentDownloadTarget: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/storage/sqlite", () => mockSqliteModule);

describe("local attachment download route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("streams blob-backed attachments from the active backend", async () => {
    mockSqliteModule.getAttachmentDownloadTarget.mockResolvedValue({
      kind: "blob",
      fileName: "notes.md",
      mimeType: "text/markdown",
      contentBase64: Buffer.from("hello").toString("base64"),
    });

    const { GET } = await import("@/app/api/attachments/download/[attachmentId]/route");
    const request = new NextRequest("http://localhost:3000/api/attachments/download/attachment-1");

    const response = await GET(request, {
      params: Promise.resolve({ attachmentId: "attachment-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown");
    expect(response.headers.get("content-disposition")).toContain("notes.md");
    await expect(response.text()).resolves.toBe("hello");
  });
});
