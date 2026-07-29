import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  mockGetApiContext,
  mockListSnippetAttachments,
  mockUploadAttachment,
} = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockListSnippetAttachments: vi.fn(),
  mockUploadAttachment: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/core/services/attachments", () => ({
  listSnippetAttachments: mockListSnippetAttachments,
  uploadAttachment: mockUploadAttachment,
}));

describe("snippet attachments API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("lists snippet attachments", async () => {
    mockListSnippetAttachments.mockResolvedValue([{ id: "attachment-1" }]);

    const { GET } = await import("./route");
    const response = await GET(
      new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1/attachments"),
      {
        params: Promise.resolve({ snippetId: "snippet-1" }),
      }
    );

    expect(mockListSnippetAttachments).toHaveBeenCalledWith({ userId: "user-1" }, "snippet-1");
    expect(response.status).toBe(200);
  });

  it("returns a validation error when the file is missing", async () => {
    const { POST } = await import("./route");
    const formData = new FormData();
    const request = new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1/attachments", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request, {
      params: Promise.resolve({ snippetId: "snippet-1" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "validation_error",
        message: "A file upload is required",
        details: undefined,
      },
    });
  });

  it("uploads an attachment from form data", async () => {
    mockUploadAttachment.mockResolvedValue({ id: "attachment-1" });

    const { POST } = await import("./route");
    const formData = new FormData();
    formData.set("file", new File(["hello"], "notes.md", { type: "text/markdown" }));
    const request = new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1/attachments", {
      method: "POST",
      body: "",
    });

    Object.defineProperty(request, "formData", {
      value: vi.fn().mockResolvedValue(formData),
    });

    const response = await POST(request, {
      params: Promise.resolve({ snippetId: "snippet-1" }),
    });

    expect(mockUploadAttachment).toHaveBeenCalledWith(
      { userId: "user-1" },
      expect.objectContaining({
        snippetId: "snippet-1",
        fileName: "notes.md",
        fileSize: 5,
        mimeType: "text/markdown",
        content: expect.any(Uint8Array),
      })
    );
    expect(response.status).toBe(201);
  });
});
