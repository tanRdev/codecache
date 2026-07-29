import { describe, expect, it, vi } from "vitest";
import {
  sanitizeError,
  sanitizeForLogging,
  handleApiError,
} from "./index";

describe("sanitizeError", () => {
  it("handles rate limit errors", () => {
    const error = new Error("Rate limit exceeded, too many attempts");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "Too many attempts. Please try again later.",
      code: "RATE_LIMITED",
    });
  });

  it("handles not found errors", () => {
    const error = new Error("Resource not found in database");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "Resource not found.",
      code: "NOT_FOUND",
    });
  });

  it("handles unauthorized errors", () => {
    const error = new Error("Access denied, user unauthorized");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "Access denied.",
      code: "UNAUTHORIZED",
    });
  });

  it("handles forbidden errors", () => {
    const error = new Error("Forbidden: access denied");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "Access denied.",
      code: "UNAUTHORIZED",
    });
  });

  it("handles invalid request errors", () => {
    const error = new Error("Invalid request parameters");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "Invalid request.",
      code: "INVALID_REQUEST",
    });
  });

  it("handles generic errors with sanitized message", () => {
    const error = new Error("Database connection failed");
    const result = sanitizeError(error);
    expect(result).toEqual({
      message: "An error occurred. Please try again.",
      code: "INTERNAL_ERROR",
    });
  });

  it("handles non-Error values", () => {
    expect(sanitizeError("string error")).toEqual({
      message: "An error occurred. Please try again.",
    });
    expect(sanitizeError(123)).toEqual({
      message: "An error occurred. Please try again.",
    });
    expect(sanitizeError(null)).toEqual({
      message: "An error occurred. Please try again.",
    });
    expect(sanitizeError(undefined)).toEqual({
      message: "An error occurred. Please try again.",
    });
  });
});

describe("sanitizeForLogging", () => {
  it("sanitizes Error objects with limited stack trace", () => {
    const error = new Error("Test error");
    error.stack = `Error: Test error
    at function1 (file1.ts:1:1)
    at function2 (file2.ts:2:2)
    at function3 (file3.ts:3:3)
    at function4 (file4.ts:4:4)
    at function5 (file5.ts:5:5)
    at function6 (file6.ts:6:6)`;

    const result = sanitizeForLogging(error);
    expect(result.message).toBe("Test error");
    expect(result.name).toBe("Error");
    const stack = result.stack as string | undefined;
    expect(stack?.split("\n").length).toBe(5);
  });

  it("handles Error without stack", () => {
    const error = new Error("No stack");
    error.stack = undefined;

    const result = sanitizeForLogging(error);
    expect(result).toEqual({
      message: "No stack",
      name: "Error",
      stack: undefined,
    });
  });

  it("handles non-Error values", () => {
    expect(sanitizeForLogging("string error")).toEqual({
      error: "string error",
    });
    expect(sanitizeForLogging(123)).toEqual({
      error: "123",
    });
    expect(sanitizeForLogging(null)).toEqual({
      error: "null",
    });
  });
});

describe("handleApiError", () => {
  it("returns sanitized error response for rate limits", () => {
    const error = new Error("Rate limit exceeded");
    const response = handleApiError(error);

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  it("returns sanitized error response for generic errors", () => {
    const error = new Error("Database failed");
    const response = handleApiError(error);

    expect(response.status).toBe(500);
  });

  it("logs the error server-side", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test error");

    handleApiError(error);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
