import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from "./snippets";
import * as authModule from "@/lib/auth";
import * as snippetsService from "@/lib/core/services/snippets";

// Mock dependencies
vi.mock("@/lib/auth");
vi.mock("@/lib/core/services/snippets");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Snippet Actions", () => {
  const mockCreateSnippet = vi.mocked(snippetsService.createSnippet);
  const mockUpdateSnippet = vi.mocked(snippetsService.updateSnippet);
  const mockDeleteSnippet = vi.mocked(snippetsService.deleteSnippet);

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSnippet.mockImplementation(async (_context, input) => {
      if (!input.title.trim()) {
        throw new Error("Title is required");
      }

      if (!input.language.trim()) {
        throw new Error("Language is required");
      }

      if (!input.code.trim()) {
        throw new Error("Code is required");
      }

      return { id: "snippet-1" };
    });
    mockUpdateSnippet.mockResolvedValue({ success: true });
    mockDeleteSnippet.mockResolvedValue({ success: true });
  });

  describe("createSnippet", () => {
    it("should return error if user is not authenticated", async () => {
      vi.mocked(authModule.auth).mockResolvedValue(null);

      const result = await createSnippet({
        title: "Test",
        language: "typescript",
        code: "const x = 1",
        tags: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be signed in to create a snippet");
    });

    it("should return error if title is empty", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      const result = await createSnippet({
        title: "",
        language: "typescript",
        code: "const x = 1",
        tags: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("should return error if language is empty", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      const result = await createSnippet({
        title: "Test",
        language: "",
        code: "const x = 1",
        tags: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Language is required");
    });

    it("should return error if code is empty", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      const result = await createSnippet({
        title: "Test",
        language: "typescript",
        code: "",
        tags: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Code is required");
    });

    it("should create snippet with valid input", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      mockCreateSnippet.mockResolvedValue({ id: "snippet-1" });

      const result = await createSnippet({
        title: "Test Snippet",
        description: "A test",
        notes: "Remember edge cases",
        language: "typescript",
        code: "const x = 1",
        tags: ["test", "typescript"],
      });

      expect(result.success).toBe(true);
      expect(result.snippetId).toBe("snippet-1");
      expect(mockCreateSnippet).toHaveBeenCalledWith(
        { userId: "user-1" },
        {
          title: "Test Snippet",
          description: "A test",
          notes: "Remember edge cases",
          language: "typescript",
          code: "const x = 1",
          tags: ["test", "typescript"],
        }
      );
    });
  });

  describe("updateSnippet", () => {
    it("should return error if user is not authenticated", async () => {
      vi.mocked(authModule.auth).mockResolvedValue(null);

      const result = await updateSnippet("snippet-1", {
        title: "Updated",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be signed in to update a snippet");
    });

    it("should update snippet with valid input", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      mockUpdateSnippet.mockResolvedValue({ success: true });

      const result = await updateSnippet("snippet-1", {
        title: "Updated Title",
      });

      expect(result.success).toBe(true);
      expect(mockUpdateSnippet).toHaveBeenCalledWith(
        { userId: "user-1" },
        "snippet-1",
        {
          title: "Updated Title",
        }
      );
    });

    it("passes notes through snippet updates", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      mockUpdateSnippet.mockResolvedValue({ success: true });

      const result = await updateSnippet("snippet-1", {
        notes: "Updated note",
      });

      expect(result.success).toBe(true);
      expect(mockUpdateSnippet).toHaveBeenCalledWith(
        { userId: "user-1" },
        "snippet-1",
        {
          notes: "Updated note",
        }
      );
    });
  });

  describe("deleteSnippet", () => {
    it("should return error if user is not authenticated", async () => {
      vi.mocked(authModule.auth).mockResolvedValue(null);

      const result = await deleteSnippet("snippet-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be signed in to delete a snippet");
    });

    it("should delete snippet successfully", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      mockDeleteSnippet.mockResolvedValue({ success: true });

      const result = await deleteSnippet("snippet-1");

      expect(result.success).toBe(true);
      expect(mockDeleteSnippet).toHaveBeenCalledWith(
        { userId: "user-1" },
        "snippet-1"
      );
    });

    it("should return error if snippet not found", async () => {
      vi.mocked(authModule.auth).mockResolvedValue({
        user: { id: "user-1", email: "test@example.com" },
      } as unknown as Awaited<ReturnType<typeof authModule.auth>>);

      mockDeleteSnippet.mockRejectedValue(new Error("Snippet not found or access denied"));

      const result = await deleteSnippet("snippet-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Snippet not found or access denied");
    });
  });
});
