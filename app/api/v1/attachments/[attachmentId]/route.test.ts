import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetApiContext, mockGetAttachmentDownload, mockDeleteAttachment } = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockGetAttachmentDownload: vi.fn(),
  mockDeleteAttachment: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/core/services/attachments", () => ({
  getAttachmentDownload: mockGetAttachmentDownload,
  deleteAttachment: mockDeleteAttachment,
}));

describe("attachment detail API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("returns attachment download metadata", async () => {
    mockGetAttachmentDownload.mockResolvedValue({ kind: "url", url: "https://example.com" });

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/attachments/attachment-1"), {
      params: Promise.resolve({ attachmentId: "attachment-1" }),
    });

    expect(mockGetAttachmentDownload).toHaveBeenCalledWith({ userId: "user-1" }, "attachment-1");
    expect(response.status).toBe(200);
  });

  it("deletes an attachment", async () => {
    mockDeleteAttachment.mockResolvedValue({ success: true });

    const { DELETE } = await import("./route");
    const response = await DELETE(new NextRequest("http://localhost:3000/api/v1/attachments/attachment-1"), {
      params: Promise.resolve({ attachmentId: "attachment-1" }),
    });

    expect(mockDeleteAttachment).toHaveBeenCalledWith({ userId: "user-1" }, "attachment-1");
    expect(response.status).toBe(200);
  });
});
