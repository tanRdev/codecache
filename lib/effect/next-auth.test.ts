import { Effect, Either } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CacheError } from "@/lib/core/errors";

const { mockAuth, mockResolveApiToken } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockResolveApiToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/auth/api-tokens", () => ({
  resolveApiToken: mockResolveApiToken,
}));

import { createNextRequestLike, getApiContextEffect, requireBrowserSessionContextEffect } from "./next-auth";

describe("Next auth Effect helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves API context from a bearer token", async () => {
    mockResolveApiToken.mockResolvedValue({ userId: "token-user" });

    const context = await Effect.runPromise(
      getApiContextEffect(createNextRequestLike({ authorization: "Bearer cache_pat_test" }))
    );

    expect(context).toEqual({ userId: "token-user" });
  });

  it("falls back to the server session", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const context = await Effect.runPromise(getApiContextEffect(createNextRequestLike()));

    expect(context).toEqual({ userId: "user-1" });
  });

  it("fails with unauthorized when the token is invalid", async () => {
    mockResolveApiToken.mockResolvedValue(null);

    const result = await Effect.runPromise(
      Effect.either(getApiContextEffect(createNextRequestLike({ authorization: "Bearer bad" })))
    );

    expect(Either.isLeft(result)).toBe(true);

    if (Either.isLeft(result)) {
      expect(result.left).toMatchObject({
        code: "unauthorized",
        message: "Unauthorized",
      } satisfies Partial<CacheError>);
    }
  });

  it("requires a browser session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await Effect.runPromise(Effect.either(requireBrowserSessionContextEffect()));

    expect(Either.isLeft(result)).toBe(true);

    if (Either.isLeft(result)) {
      expect(result.left).toMatchObject({
        code: "unauthorized",
        message: "Unauthorized",
      } satisfies Partial<CacheError>);
    }
  });
});
