import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockRevalidatePath } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const { mockCreateSnippet } = vi.hoisted(() => ({
  mockCreateSnippet: vi.fn(),
}));

vi.mock("@/lib/storage/sqlite", () => ({
  createSnippet: mockCreateSnippet,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("snippet actions storage routing", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("resolves storage per user before creating a snippet", async () => {
    mockCreateSnippet.mockResolvedValue({ id: "snippet-1" });

    const { createSnippet: createSnippetAction } = await import("./snippets");
    const result = await createSnippetAction({
      title: "Test Snippet",
      description: "Stored in local sqlite",
      notes: "Uses runtime storage resolution",
      language: "typescript",
      code: "const runtime = true;",
      tags: ["storage"],
    });

    expect(result).toEqual({
      success: true,
      snippetId: "snippet-1",
    });
    expect(mockCreateSnippet).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: "user-1",
      title: "Test Snippet",
      description: "Stored in local sqlite",
      notes: "Uses runtime storage resolution",
      language: "typescript",
      code: "const runtime = true;",
      tags: ["storage"],
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
