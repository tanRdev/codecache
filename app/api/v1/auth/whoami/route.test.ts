import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetApiContext } = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

describe("whoami API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("returns the authenticated user id", async () => {
    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/auth/whoami"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { userId: "user-1" },
    });
  });
});
