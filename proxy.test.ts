import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

import { proxy, shouldAllowMarketingRoute, shouldBypassProxy } from "./proxy";

describe("shouldBypassProxy", () => {
  it("skips next internals and api routes", () => {
    expect(shouldBypassProxy("/_next/webpack-hmr")).toBe(true);
    expect(shouldBypassProxy("/api/ready")).toBe(true);
  });

  it("keeps application routes protected", () => {
    expect(shouldBypassProxy("/dashboard")).toBe(false);
  });
});

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("redirects unauthenticated users on protected routes", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await proxy(new NextRequest("http://localhost:3000/dashboard?q=react"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/sign-in?callbackUrl=%2Fdashboard%3Fq%3Dreact"
    );
  });

  it("redirects authenticated users away from sign-in", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const response = await proxy(new NextRequest("http://localhost:3000/sign-in?callbackUrl=https://evil.example/steal"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects application routes to installation docs in marketing mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    const response = await proxy(new NextRequest("http://localhost:3000/dashboard"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/docs/getting-started/installation"
    );
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("does not expose application APIs in marketing mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    const response = await proxy(new NextRequest("http://localhost:3000/api/v1/snippets"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "not_available" },
      ok: false,
    });
    expect(mockAuth).not.toHaveBeenCalled();
  });
});

describe("shouldAllowMarketingRoute", () => {
  it("allows only the public site, docs, assets, and health check", () => {
    expect(shouldAllowMarketingRoute("/")).toBe(true);
    expect(shouldAllowMarketingRoute("/docs/getting-started")).toBe(true);
    expect(shouldAllowMarketingRoute("/_next/static/app.js")).toBe(true);
    expect(shouldAllowMarketingRoute("/api/health")).toBe(true);
    expect(shouldAllowMarketingRoute("/sign-in")).toBe(false);
    expect(shouldAllowMarketingRoute("/setup")).toBe(false);
    expect(shouldAllowMarketingRoute("/api/v1/snippets")).toBe(false);
  });
});
