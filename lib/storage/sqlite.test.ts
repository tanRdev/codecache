// @vitest-environment node
// (node environment required so vi.mock intercepts node:fs/promises in the
// modules under test; jsdom bypasses builtin module mocks outside the test file)
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockRm } = vi.hoisted(() => ({
  mockRm: vi.fn(),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs/promises")>();
  mockRm.mockImplementation(original.rm);
  return {
    ...original,
    rm: mockRm,
  };
});

import { clearDbCache } from "@/lib/drizzle";
import {
  configureLocalStorage,
  createSnippet,
  deleteSnippet,
  ensureLocalUser,
  getSnippetById,
  listSnippets,
  saveAttachment,
  updateSnippet,
} from "@/lib/storage/sqlite";

const USER_ID = "user-transactions";

function makeSnippetInput(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    userId: USER_ID,
    title: `Snippet ${id}`,
    description: null,
    notes: null,
    language: "typescript",
    code: `const value = "${id}";`,
    tags: ["alpha"],
    ...overrides,
  } as Parameters<typeof createSnippet>[0];
}

describe("sqlite storage", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), "cache-sqlite-test-"));
    configureLocalStorage({ databasePath: path.join(tempDir, "cache.sqlite") });
    await ensureLocalUser(USER_ID);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearDbCache();
    rmSync(tempDir, { force: true, recursive: true });
  });

  describe("createSnippet", () => {
    it("rolls back the snippet row when the tag insert fails", async () => {
      vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(() => {
        throw new Error("boom during tag insert");
      });

      await expect(createSnippet(makeSnippetInput("snippet-1"))).rejects.toThrow(
        "boom during tag insert"
      );

      expect(await listSnippets(USER_ID)).toEqual([]);
      expect(await getSnippetById(USER_ID, "snippet-1")).toBeNull();
    });
  });

  describe("updateSnippet", () => {
    it("rolls back the snippet update and tag rewrite when the tag insert fails", async () => {
      await createSnippet(makeSnippetInput("snippet-1", { tags: ["original"] }));

      vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(() => {
        throw new Error("boom during tag rewrite");
      });

      await expect(
        updateSnippet(USER_ID, "snippet-1", { title: "New title", tags: ["replacement"] })
      ).rejects.toThrow("boom during tag rewrite");

      const snippet = await getSnippetById(USER_ID, "snippet-1");
      expect(snippet?.title).toBe(`Snippet snippet-1`);
      expect(snippet?.tags).toEqual(["original"]);
    });
  });

  describe("deleteSnippet", () => {
    it("removes the snippet and cascades attachment rows", async () => {
      await createSnippet(makeSnippetInput("snippet-1"));
      await saveAttachment({
        id: "attachment-1",
        snippetId: "snippet-1",
        userId: USER_ID,
        fileName: "notes.txt",
        fileSize: 10,
        mimeType: "text/plain",
        storageKey: "user/attachment-1-notes.txt",
      });

      expect(await deleteSnippet(USER_ID, "snippet-1")).toBe(true);
      expect(await getSnippetById(USER_ID, "snippet-1")).toBeNull();
    });

    it("leaves no orphaned rows when attachment file cleanup fails", async () => {
      await createSnippet(makeSnippetInput("snippet-1"));
      await saveAttachment({
        id: "attachment-1",
        snippetId: "snippet-1",
        userId: USER_ID,
        fileName: "notes.txt",
        fileSize: 10,
        mimeType: "text/plain",
        storageKey: "user/attachment-1-notes.txt",
      });

      mockRm.mockRejectedValueOnce(new Error("disk gone"));

      await expect(deleteSnippet(USER_ID, "snippet-1")).rejects.toThrow("disk gone");

      // The DB row is deleted inside the transaction before file cleanup runs,
      // so a filesystem failure can only orphan files, never rows.
      expect(await getSnippetById(USER_ID, "snippet-1")).toBeNull();
    });
  });

  describe("listSnippets search escaping", () => {
    it("treats % in the query as a literal character", async () => {
      await createSnippet(makeSnippetInput("snippet-1", { code: "return 100% done;" }));
      await createSnippet(makeSnippetInput("snippet-2", { code: "return 1000 done;" }));

      const results = await listSnippets(USER_ID, { query: "100%" });

      expect(results.map((snippet) => snippet.id)).toEqual(["snippet-1"]);
    });

    it("treats _ in the query as a literal character", async () => {
      await createSnippet(makeSnippetInput("snippet-1", { code: "const a_b = 1;" }));
      await createSnippet(makeSnippetInput("snippet-2", { code: "const axb = 1;" }));

      const results = await listSnippets(USER_ID, { query: "a_b" });

      expect(results.map((snippet) => snippet.id)).toEqual(["snippet-1"]);
    });
  });
});
