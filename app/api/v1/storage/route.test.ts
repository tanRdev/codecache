import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetApiContext, mockGetEffectiveStorageSettings } = vi.hoisted(() => ({
  mockGetApiContext: vi.fn(),
  mockGetEffectiveStorageSettings: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  getApiContext: mockGetApiContext,
}));

vi.mock("@/lib/storage/settings", () => ({
  getEffectiveStorageSettings: mockGetEffectiveStorageSettings,
  getStorageBackendOptions: vi.fn(() => []),
}));

describe("storage API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiContext.mockResolvedValue({ userId: "user-1" });
  });

  it("returns storage settings", async () => {
    mockGetEffectiveStorageSettings.mockResolvedValue({ activeBackend: "sqlite" });

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/api/v1/storage"));

    expect(mockGetEffectiveStorageSettings).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(200);
  });

  it("saves sqlite backend", async () => {
    const { POST } = await import("./route");
    const response = await POST(new NextRequest("http://localhost:3000/api/v1/storage", {
      method: "POST",
      body: JSON.stringify({ backend: "sqlite" }),
    }));

    expect(response.status).toBe(200);
  });

  it("rejects unknown backend values", async () => {
    const { POST } = await import("./route");
    const response = await POST(new NextRequest("http://localhost:3000/api/v1/storage", {
      method: "POST",
      body: JSON.stringify({ backend: "unknown_backend" }),
    }));

    expect(response.status).toBe(400);
  });
});
