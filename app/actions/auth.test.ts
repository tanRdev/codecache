import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  bootstrapOwnerAccountSpy,
  isOwnerConfiguredSpy,
  signInWithPasswordSpy,
  signOutSpy,
  getEnvSpy,
} = vi.hoisted(() => ({
  bootstrapOwnerAccountSpy: vi.fn(),
  isOwnerConfiguredSpy: vi.fn(),
  signInWithPasswordSpy: vi.fn(),
  signOutSpy: vi.fn(),
  getEnvSpy: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  bootstrapOwnerAccount: bootstrapOwnerAccountSpy,
  isOwnerConfigured: isOwnerConfiguredSpy,
  signInWithPassword: signInWithPasswordSpy,
  signOut: signOutSpy,
}));

vi.mock("@/lib/env", () => ({
  getEnv: getEnvSpy,
}));

describe("auth actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isOwnerConfiguredSpy.mockResolvedValue(false);
    getEnvSpy.mockReturnValue({ OWNER_SETUP_TOKEN: "setup-secret-token-1234567890", NODE_ENV: "test" });
  });

  it("rejects owner creation when setup token is invalid", async () => {
    const { createOwner } = await import("./auth");

    const result = await createOwner({
      email: "owner@example.com",
      password: "VerySecurePass123!",
      setupToken: "wrong-token",
    });

    expect(result).toEqual({
      success: false,
      error: "Owner setup token is invalid",
    });
    expect(bootstrapOwnerAccountSpy).not.toHaveBeenCalled();
  });
});
