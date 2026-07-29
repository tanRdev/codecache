import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  mockGetApiContext,
  mockGetSnippet,
  mockUpdateSnippet,
  mockDeleteSnippet,
} = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockGetSnippet: vi.fn(),
  mockUpdateSnippet: vi.fn(),
  mockDeleteSnippet: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/core/services/snippets", () => ({
  getSnippet: mockGetSnippet,
  updateSnippet: mockUpdateSnippet,
  deleteSnippet: mockDeleteSnippet,
}));

describe("snippet detail API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("loads a snippet by id", async () => {
    mockGetSnippet.mockResolvedValue({ id: "snippet-1" });

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1"), {
      params: Promise.resolve({ snippetId: "snippet-1" }),
    });

    expect(mockGetSnippet).toHaveBeenCalledWith({ userId: "user-1" }, "snippet-1");
    expect(response.status).toBe(200);
  });

  it("updates a snippet with sanitized body fields", async () => {
    mockUpdateSnippet.mockResolvedValue({ success: true });

    const { PATCH } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1", {
      method: "PATCH",
      body: JSON.stringify({
        title: "Updated",
        description: false,
        notes: "Note",
        language: "ts",
        code: "const x = 1;",
        tags: ["alpha", 1, "beta"],
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ snippetId: "snippet-1" }),
    });

    expect(mockUpdateSnippet).toHaveBeenCalledWith({ userId: "user-1" }, "snippet-1", {
      title: "Updated",
      description: undefined,
      notes: "Note",
      language: "ts",
      code: "const x = 1;",
      tags: ["alpha", "beta"],
    });
    expect(response.status).toBe(200);
  });

  it("deletes a snippet", async () => {
    mockDeleteSnippet.mockResolvedValue({ success: true });

    const { DELETE } = await import("./route");
    const response = await DELETE(new NextRequest("http://localhost:3000/api/v1/snippets/snippet-1"), {
      params: Promise.resolve({ snippetId: "snippet-1" }),
    });

    expect(mockDeleteSnippet).toHaveBeenCalledWith({ userId: "user-1" }, "snippet-1");
    expect(response.status).toBe(200);
  });
});
