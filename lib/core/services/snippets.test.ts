import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SnippetRecord } from "@/lib/storage/types";

const { mockSqliteModule } = vi.hoisted(() => ({
  mockSqliteModule: {
    createSnippet: vi.fn(),
    deleteSnippet: vi.fn(),
    getSnippetById: vi.fn(),
    getSnippetTags: vi.fn(),
    getUserTags: vi.fn(),
    listSnippets: vi.fn(),
    updateSnippet: vi.fn(),
    listAttachments: vi.fn(),
    getAttachmentById: vi.fn(),
    saveAttachment: vi.fn(),
    savePendingAttachmentUpload: vi.fn(),
    getPendingAttachmentUpload: vi.fn(),
    deletePendingAttachmentUpload: vi.fn(),
    storeAttachmentBinary: vi.fn(),
    deleteAttachment: vi.fn(),
    getAttachmentDownloadTarget: vi.fn(),
  },
}));

vi.mock("@/lib/storage/sqlite", () => mockSqliteModule);

import {
  createSnippet,
  deleteSnippet,
  getSnippet,
  listSnippets,
  updateSnippet,
} from "@/lib/core/services/snippets";

describe("snippet service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates required fields before creating a snippet", async () => {
    await expect(
      createSnippet(
        { userId: "user-1" },
        {
          title: "",
          language: "typescript",
          code: "const x = 1",
          tags: [],
        }
      )
    ).rejects.toMatchObject({
      code: "validation_error",
      message: "Title is required",
    });
  });

  it("normalizes metadata while preserving code exactly", async () => {
    mockSqliteModule.createSnippet.mockResolvedValue({ id: "snippet-1" });

    const result = await createSnippet(
      { userId: "user-1" },
      {
        title: " Test Snippet ",
        description: " Description ",
        notes: " Notes ",
        language: " typescript ",
        code: " const x = 1 ",
        tags: ["test"],
      }
    );

    expect(result).toEqual({ id: "snippet-1" });
    expect(mockSqliteModule.createSnippet).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: "user-1",
      title: "Test Snippet",
      description: "Description",
      notes: "Notes",
      language: "typescript",
      code: " const x = 1 ",
      tags: ["test"],
    });
  });

  it("enforces limits for direct CLI callers", async () => {
    await expect(
      createSnippet(
        { userId: "user-1" },
        {
          title: "x".repeat(201),
          language: "text",
          code: "content",
          tags: [],
        }
      )
    ).rejects.toMatchObject({
      code: "validation_error",
      message: "Title must be 200 characters or fewer",
    });
  });

  it("maps missing snippets during update", async () => {
    mockSqliteModule.updateSnippet.mockResolvedValue(false);

    await expect(
      updateSnippet({ userId: "user-1" }, "snippet-1", { title: "Updated" })
    ).rejects.toMatchObject({
      code: "not_found",
      message: "Snippet not found or access denied",
    });
  });

  it("lists snippets for the active user", async () => {
    const record: SnippetRecord = {
      id: "snippet-1",
      user_id: "user-1",
      title: "Test",
      description: null,
      notes: null,
      language: "ts",
      code: "const x = 1",
      search_text: "test",
      created_at: "2026-03-30T00:00:00.000Z",
      updated_at: "2026-03-30T00:00:00.000Z",
      tags: [],
    };
    mockSqliteModule.listSnippets.mockResolvedValue([record]);

    const result = await listSnippets({ userId: "user-1" });

    expect(result).toEqual([record]);
    expect(mockSqliteModule.listSnippets).toHaveBeenCalledWith("user-1", undefined);
  });

  it("maps missing snippets during get and delete", async () => {
    mockSqliteModule.getSnippetById.mockResolvedValue(null);
    mockSqliteModule.deleteSnippet.mockResolvedValue(false);

    await expect(getSnippet({ userId: "user-1" }, "snippet-1")).rejects.toMatchObject({
      code: "not_found",
      message: "Snippet not found",
    });

    await expect(deleteSnippet({ userId: "user-1" }, "snippet-1")).rejects.toMatchObject({
      code: "not_found",
      message: "Snippet not found or access denied",
    });
  });
});
