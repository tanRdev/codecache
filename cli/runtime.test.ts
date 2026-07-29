import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateProfile } = vi.hoisted(() => ({
  mockUpdateProfile: vi.fn(),
}));

vi.mock("@/cli/config", () => ({
  getDefaultDatabasePath: () => "/tmp/cache-runtime-test.sqlite",
  updateProfile: mockUpdateProfile,
}));

vi.mock("@/lib/storage/sqlite", () => ({
  configureLocalStorage: vi.fn(),
  ensureLocalUser: vi.fn(async () => undefined),
}));

vi.mock("@/lib/core/services/snippets", () => ({
  createSnippet: vi.fn(),
  deleteSnippet: vi.fn(),
  getSnippet: vi.fn(),
  listSnippets: vi.fn(),
  updateSnippet: vi.fn(),
}));

vi.mock("@/lib/core/services/attachments", () => ({
  deleteAttachment: vi.fn(),
  getAttachmentDownload: vi.fn(),
  listSnippetAttachments: vi.fn(),
  uploadAttachment: vi.fn(),
}));

import { createRuntime } from "@/cli/runtime";

describe("cli runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProfile.mockImplementation(async (_profileName: string, updater: (profile: unknown) => unknown) =>
      updater({
        name: "local",
        mode: "direct",
        backend: "sqlite",
        userId: "user-1",
      })
    );
  });

  it("builds a direct sqlite runtime", async () => {
    const runtime = createRuntime({
      name: "local",
      mode: "direct",
      backend: "sqlite",
      userId: "user-1",
    });

    await expect(runtime.profileInfo()).resolves.toMatchObject({
      backend: "sqlite",
      mode: "direct",
    });
  });

  it("persists sqlite backend when storage set runs", async () => {
    const runtime = createRuntime({
      name: "local",
      mode: "direct",
      backend: "sqlite",
      userId: "user-1",
    });

    await runtime.storageSet({ backend: "sqlite" });

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  });
});
