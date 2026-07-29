import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetEnv } = vi.hoisted(() => ({
  mockGetEnv: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: mockGetEnv,
}));

import {
  getEffectiveStorageSettings,
  getStorageBackendLabel,
  getStorageBackendOptions,
} from "./settings";

describe("storage settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEnv.mockReturnValue({
      SQLITE_DATABASE_PATH: "/data/cache.sqlite",
      ATTACHMENTS_ROOT: "/data/attachments",
    });
  });

  it("returns sqlite backend label", () => {
    expect(getStorageBackendLabel()).toBe("SQLite");
  });

  it("returns single sqlite backend option", () => {
    expect(getStorageBackendOptions()).toEqual([
      expect.objectContaining({
        id: "sqlite",
        label: "SQLite",
        available: true,
      }),
    ]);
  });

  it("returns effective sqlite settings", async () => {
    await expect(getEffectiveStorageSettings("user-1")).resolves.toEqual({
      activeBackend: "sqlite",
      availableBackends: [expect.objectContaining({ id: "sqlite" })],
      backendLabel: "SQLite",
      publicConfig: {
        databasePath: "/data/cache.sqlite",
        attachmentsRoot: "/data/attachments",
      },
      status: "ready",
      lastValidatedAt: null,
      lastError: null,
    });
  });
});
