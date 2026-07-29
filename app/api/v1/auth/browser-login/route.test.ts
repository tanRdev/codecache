import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  mockRequireBrowserSessionContext,
  mockCreateApiToken,
  mockCreateBrowserLoginExchange,
} = vi.hoisted(() => ({
  mockRequireBrowserSessionContext: vi.fn(),
  mockCreateApiToken: vi.fn(),
  mockCreateBrowserLoginExchange: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  requireBrowserSessionContext: mockRequireBrowserSessionContext,
}));

vi.mock("@/lib/auth/api-tokens", () => ({
  createApiToken: mockCreateApiToken,
}));

vi.mock("@/lib/auth/browser-login", () => ({
  createBrowserLoginExchange: mockCreateBrowserLoginExchange,
}));

describe("browser CLI auth route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockRequireBrowserSessionContext.mockResolvedValue({ userId: "user-1" });
    mockCreateApiToken.mockResolvedValue({
      id: "token-1",
      token: "cache_pat_test",
      tokenPrefix: "cache_pat",
      userId: "user-1",
      name: "CLI token",
    });
    mockCreateBrowserLoginExchange.mockResolvedValue({
      code: "exchange-code-123",
      expiresAt: "2026-03-30T00:05:00.000Z",
      name: "CLI token",
    });
  });

  it("creates an exchange code and redirects back to the loopback callback", async () => {
    const { GET } = await import("@/app/api/v1/auth/browser-login/route");
    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/browser-login?callback=http://127.0.0.1:4567/callback&name=CLI%20token"
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:4567/callback?code=exchange-code-123"
    );
    expect(mockCreateBrowserLoginExchange).toHaveBeenCalledWith({
      userId: "user-1",
      token: "cache_pat_test",
      name: "CLI token",
    });
  });

  it("rejects non-loopback callback URLs", async () => {
    const { GET } = await import("@/app/api/v1/auth/browser-login/route");
    const request = new NextRequest(
      "http://localhost:3000/api/v1/auth/browser-login?callback=https://example.com/callback"
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "validation_error",
        message: "Callback must be a localhost loopback URL",
        details: undefined,
      },
    });
  });
});
