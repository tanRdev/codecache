import { describe, expect, it, vi } from "vitest";

const { mockGetDb } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
}));

vi.mock("@/lib/drizzle", () => ({
  getDb: mockGetDb,
}));

describe("ready route", () => {
  it("returns readiness data when dependencies respond", async () => {
    mockGetDb.mockReturnValue({
      $client: {
        prepare: vi.fn(() => ({ get: vi.fn(() => ({ ready: 1 })) })),
      },
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        status: "ready",
        checks: {
          database: "ok",
        },
      },
    });
  });
});
