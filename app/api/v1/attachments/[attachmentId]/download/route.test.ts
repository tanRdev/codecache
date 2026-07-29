import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { CacheError } from "@/lib/core/errors";

const { mockGetApiContext, mockGetAttachmentDownload } = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockGetAttachmentDownload: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/core/services/attachments", () => ({
  getAttachmentDownload: mockGetAttachmentDownload,
}));

describe("attachment download API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("returns blob content with download headers", async () => {
    mockGetAttachmentDownload.mockResolvedValue({
      kind: "blob",
      fileName: "notes.md",
      mimeType: "text/markdown",
      contentBase64: Buffer.from("hello").toString("base64"),
    });

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/attachments/id/download"), {
      params: Promise.resolve({ attachmentId: "attachment-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown");
    expect(response.headers.get("content-disposition")).toContain("notes.md");
    await expect(response.text()).resolves.toBe("hello");
  });

  it("returns not found payload when attachment is missing", async () => {
    mockGetAttachmentDownload.mockRejectedValue(
      new CacheError("not_found", "Attachment not found", 404)
    );

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/attachments/id/download"), {
      params: Promise.resolve({ attachmentId: "attachment-1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "not_found",
        message: "Attachment not found",
        details: undefined,
      },
    });
  });
});
