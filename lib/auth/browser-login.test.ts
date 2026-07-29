import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetDb } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
}));

vi.mock("@/lib/drizzle", () => ({
  getDb: mockGetDb,
}));

import {
  consumeBrowserLoginExchange,
  createBrowserLoginExchange,
} from "@/lib/auth/browser-login";

describe("browser login exchange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENCRYPTION_KEY = "test-encryption-key-for-testing-32-ch!";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and consumes a one-time exchange code", async () => {
    const state: { exchangeId?: string; encryptedPayload?: string } = {};
    const insertValues = vi.fn((values: { encrypted_payload: string }) => {
      state.exchangeId = "exchange-1";
      state.encryptedPayload = values.encrypted_payload;
      return Promise.resolve();
    });
    const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(state.exchangeId
      ? [{ id: state.exchangeId, user_id: "user-1", encrypted_payload: state.encryptedPayload }]
      : []));
    const selectWhere = vi.fn(() => ({ limit: selectLimit }));
    const selectFrom = vi.fn(() => ({ where: selectWhere }));
    const updateWhere = vi.fn().mockImplementation(() => {
      state.exchangeId = undefined;
      return Promise.resolve();
    });
    const updateSet = vi.fn(() => ({ where: updateWhere }));

    mockGetDb.mockReturnValue({
      insert: vi.fn(() => ({ values: insertValues })),
      select: vi.fn(() => ({ from: selectFrom })),
      update: vi.fn(() => ({ set: updateSet })),
    });

    const exchange = await createBrowserLoginExchange({
      userId: "user-1",
      token: "cache_pat_secret",
      name: "CLI token",
    });

    const consumed = await consumeBrowserLoginExchange(exchange.code);

    expect(consumed).toEqual({
      userId: "user-1",
      token: "cache_pat_secret",
      name: "CLI token",
    });

    await expect(consumeBrowserLoginExchange(exchange.code)).rejects.toThrow(
      "Browser login exchange is invalid or expired"
    );
  });

  it("rejects expired exchange codes", async () => {
    vi.useFakeTimers();

    const selectLimit = vi.fn().mockResolvedValue([]);
    const selectWhere = vi.fn(() => ({ limit: selectLimit }));
    const selectFrom = vi.fn(() => ({ where: selectWhere }));

    mockGetDb.mockReturnValue({
      insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
      select: vi.fn(() => ({ from: selectFrom })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    });

    const exchange = await createBrowserLoginExchange(
      {
        userId: "user-1",
        token: "cache_pat_secret",
        name: "CLI token",
      },
      { ttlMs: 1000 }
    );

    vi.advanceTimersByTime(1001);

    await expect(consumeBrowserLoginExchange(exchange.code)).rejects.toThrow(
      "Browser login exchange is invalid or expired"
    );
  });
});
