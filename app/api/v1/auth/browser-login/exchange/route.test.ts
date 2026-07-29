import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const { mockConsumeBrowserLoginExchange } = vi.hoisted(() => ({
  mockConsumeBrowserLoginExchange: vi.fn(),
}));

vi.mock("@/lib/auth/browser-login", () => ({
  consumeBrowserLoginExchange: mockConsumeBrowserLoginExchange,
}));

describe("browser login exchange route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsumeBrowserLoginExchange.mockResolvedValue({
      name: "CLI token",
      token: "cache_pat_test",
      userId: "user-1",
    });
  });

  it("exchanges a one-time code for a token", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/auth/browser-login/exchange", {
      method: "POST",
      body: JSON.stringify({ code: "exchange-code-123" }),
    });

    const response = await POST(request);

    expect(mockConsumeBrowserLoginExchange).toHaveBeenCalledWith("exchange-code-123");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        name: "CLI token",
        token: "cache_pat_test",
      },
    });
  });

  it("rejects requests without a code", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/auth/browser-login/exchange", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "validation_error",
        message: "A browser login exchange code is required",
        details: undefined,
      },
    });
  });
});
