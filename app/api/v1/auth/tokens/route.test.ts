import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireBrowserSessionContext, mockCreateApiToken } = vi.hoisted(() => ({
  mockRequireBrowserSessionContext: vi.fn(),
  mockCreateApiToken: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  requireBrowserSessionContext: mockRequireBrowserSessionContext,
}));

vi.mock("@/lib/auth/api-tokens", () => ({
  createApiToken: mockCreateApiToken,
}));

describe("auth tokens API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireBrowserSessionContext.mockResolvedValue({ userId: "user-1" });
    mockCreateApiToken.mockResolvedValue({ token: "cache_pat_test", name: "CLI token" });
  });

  it("creates a token with a trimmed custom name", async () => {
    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/v1/auth/tokens", {
      method: "POST",
      body: JSON.stringify({ name: "  Personal CLI token  " }),
    });

    const response = await POST(request);

    expect(mockCreateApiToken).toHaveBeenCalledWith("user-1", "Personal CLI token");
    expect(response.status).toBe(201);
  });

  it("falls back to the default name when the body is invalid JSON", async () => {
    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/v1/auth/tokens", {
      method: "POST",
      body: "{",
    });

    const response = await POST(request);

    expect(mockCreateApiToken).toHaveBeenCalledWith("user-1", "CLI token");
    expect(response.status).toBe(201);
  });
});
