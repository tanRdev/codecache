import { beforeEach, describe, expect, it, vi } from "vitest";
import { Effect, Either } from "effect";
import { CacheError } from "@/lib/core/errors";

const { mockAuth, mockRevalidatePath } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import {
  createActionFailure,
  UnauthorizedActionError,
  getActionErrorMessage,
  getRateLimitedDetails,
  requireUserIdEffect,
  revalidatePathsEffect,
  runServerAction,
} from "./server-actions";

describe("server action Effect helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await Effect.runPromise(Effect.either(requireUserIdEffect("Sign in first")));

    expect(Either.isRight(result)).toBe(true);

    if (Either.isRight(result)) {
      expect(result.right).toBe("user-1");
    }
  });

  it("fails with an unauthorized action error when the session is missing", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await Effect.runPromise(Effect.either(requireUserIdEffect("Sign in first")));

    expect(Either.isLeft(result)).toBe(true);

    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(UnauthorizedActionError);

      if (result.left instanceof UnauthorizedActionError) {
        expect(result.left.reason).toBe("Sign in first");
      }
    }
  });

  it("revalidates every requested path", async () => {
    await Effect.runPromise(revalidatePathsEffect(["/dashboard", "/snippets/snippet-1"]));

    expect(mockRevalidatePath).toHaveBeenNthCalledWith(1, "/dashboard");
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(2, "/snippets/snippet-1");
    expect(mockRevalidatePath).toHaveBeenCalledTimes(2);
  });

  it("maps unauthorized and rate-limited errors", () => {
    const unauthorized = new UnauthorizedActionError({
      reason: "You must be signed in",
    });
    const rateLimited = new CacheError(
      "rate_limited",
      "Rate limit exceeded",
      429,
      { resetAt: 123 }
    );

    expect(getActionErrorMessage(unauthorized, "fallback")).toBe("You must be signed in");
    expect(getActionErrorMessage(rateLimited, "fallback")).toBe("Rate limit exceeded");
    expect(getRateLimitedDetails(rateLimited)).toEqual({
      rateLimited: true,
      resetAt: 123,
    });
    expect(getRateLimitedDetails(new CacheError("internal_error", "Unexpected error", 500))).toEqual({});
  });

  it("creates a standard action failure payload", () => {
    const result = createActionFailure(new CacheError("internal_error", "Boom", 500), "fallback");

    expect(result).toEqual({
      success: false,
      error: "Boom",
    });
  });

  it("runs an Effect program and maps failures", async () => {
    const mapFailure = (error: unknown): { success: false; error: string } => ({
      success: false,
      error: createActionFailure(error, "fallback").error,
    });
    const mapSuccess = (value: string): { success: true; value: string } => ({
      success: true,
      value,
    });

    const success = await runServerAction<
      string,
      unknown,
      { success: true; value: string } | { success: false; error: string }
    >({
      effect: Effect.succeed("done"),
      onSuccess: mapSuccess,
      onFailure: mapFailure,
    });
    const failure = await runServerAction<
      string,
      CacheError,
      { success: true; value: string } | { success: false; error: string }
    >({
      effect: Effect.fail(new CacheError("internal_error", "failed", 500)),
      onSuccess: mapSuccess,
      onFailure: mapFailure,
    });

    expect(success).toEqual({ success: true, value: "done" });
    expect(failure).toEqual({ success: false, error: "failed" });
  });
});
