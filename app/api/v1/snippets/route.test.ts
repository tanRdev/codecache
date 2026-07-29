import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetApiContext, mockListSnippets, mockCreateSnippet } = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockListSnippets: vi.fn(),
  mockCreateSnippet: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/core/services/snippets", () => ({
  listSnippets: mockListSnippets,
  createSnippet: mockCreateSnippet,
}));

describe("snippets API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("lists snippets with normalized tags", async () => {
    mockListSnippets.mockResolvedValue([{ id: "snippet-1" }]);

    const { GET } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/v1/snippets?query=auth&tags=react,%20typescript"
    );

    const response = await GET(request);

    expect(mockListSnippets).toHaveBeenCalledWith({ userId: "user-1" }, {
      query: "auth",
      tags: ["react", "typescript"],
    });
    expect(response.status).toBe(200);
  });

  it("creates a snippet from sanitized request data", async () => {
    mockCreateSnippet.mockResolvedValue({ id: "snippet-1" });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/v1/snippets", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        description: "Description",
        notes: 123,
        language: "ts",
        code: "const x = 1;",
        tags: ["alpha", 123, "beta"],
      }),
    });

    const response = await POST(request);

    expect(mockCreateSnippet).toHaveBeenCalledWith({ userId: "user-1" }, {
      title: "Test",
      description: "Description",
      notes: undefined,
      language: "ts",
      code: "const x = 1;",
      tags: ["alpha", "beta"],
    });
    expect(response.status).toBe(201);
  });
});
