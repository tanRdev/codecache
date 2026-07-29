import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDb } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
}));

vi.mock("@/lib/drizzle", () => ({
  getDb: mockGetDb,
}));

import { createApiToken, resolveApiToken } from "@/lib/auth/api-tokens";

describe("api tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a token and resolves it back to the owning user", async () => {
    const insertReturning = vi.fn().mockResolvedValue([
      {
        id: "token-1",
        user_id: "user-1",
        token_prefix: "prefix123",
        name: "CLI token",
      },
    ]);
    const insertValues = vi.fn(() => ({ returning: insertReturning }));
    const selectLimit = vi.fn().mockResolvedValue([
      {
        id: "token-1",
        user_id: "user-1",
        name: "CLI token",
      },
    ]);
    const selectWhere = vi.fn(() => ({ limit: selectLimit }));
    const selectFrom = vi.fn(() => ({ where: selectWhere }));
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));

    mockGetDb.mockReturnValue({
      insert: vi.fn(() => ({ values: insertValues })),
      select: vi.fn(() => ({ from: selectFrom })),
      update: vi.fn(() => ({ set: updateSet })),
    });

    const token = await createApiToken("user-1", "CLI token");
    const resolved = await resolveApiToken(token.token);

    expect(token.token).toContain("cache_pat_");
    expect(resolved).toMatchObject({
      userId: "user-1",
      tokenId: "token-1",
      name: "CLI token",
    });
  });
});
