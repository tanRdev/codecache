import { describe, expect, it, vi } from "vitest";
import { Effect } from "effect";
import {
  HttpClientError,
  FileSystemError,
  BrowserAuthError,
  ConfigError,
  tryHttpRequest,
  parseApiResponse,
  tryFileRead,
  tryFileWrite,
  tryParseJson,
  runCliEffect,
  runCliEffectWithErrorHandling,
  isApiSuccess,
} from "./cli";

describe("Effect CLI module", () => {
  describe("error classes", () => {
    it("HttpClientError can be created with all fields", () => {
      const error = new HttpClientError({
        code: "request_failed",
        message: "Network error",
        status: 500,
        details: { retryable: true },
      });
      expect(error._tag).toBe("HttpClientError");
      expect(error.code).toBe("request_failed");
      expect(error.status).toBe(500);
    });

    it("FileSystemError captures operation details", () => {
      const error = new FileSystemError({
        operation: "read",
        message: "File not found",
        path: "/tmp/test.txt",
      });
      expect(error._tag).toBe("FileSystemError");
      expect(error.operation).toBe("read");
    });

    it("BrowserAuthError handles auth failures", () => {
      const error = new BrowserAuthError({
        code: "timeout",
        message: "Browser auth timed out",
      });
      expect(error._tag).toBe("BrowserAuthError");
    });

    it("ConfigError handles config issues", () => {
      const error = new ConfigError({
        code: "profile_not_found",
        message: "Profile missing",
      });
      expect(error._tag).toBe("ConfigError");
    });
  });

  describe("isApiSuccess", () => {
    it("returns true for valid success payloads", () => {
      expect(isApiSuccess({ ok: true, data: "test" })).toBe(true);
      expect(isApiSuccess({ ok: true, data: { id: 1 } })).toBe(true);
    });

    it("returns false for invalid payloads", () => {
      expect(isApiSuccess({ ok: false, data: "test" })).toBe(false);
      expect(isApiSuccess({ ok: true })).toBe(false);
      expect(isApiSuccess(null)).toBe(false);
      expect(isApiSuccess("string")).toBe(false);
    });
  });

  describe("tryHttpRequest", () => {
    it("succeeds on successful request", async () => {
      const result = await Effect.runPromise(
        tryHttpRequest(async () => "success")
      );
      expect(result).toBe("success");
    });

    it("fails with HttpClientError on error", async () => {
      const effect = tryHttpRequest(async () => {
        throw new Error("Network failed");
      });

      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(HttpClientError);
        expect(result.left.code).toBe("request_failed");
      }
    });

    it("re-wraps existing HttpClientError", async () => {
      const existingError = new HttpClientError({
        code: "custom",
        message: "Custom",
      });

      const effect = tryHttpRequest(async () => {
        throw existingError;
      });

      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.code).toBe("custom");
      }
    });

    it("handles non-Error throws", async () => {
      const effect = tryHttpRequest(async () => {
        throw "string error";
      });

      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.code).toBe("unknown_error");
      }
    });
  });

  describe("parseApiResponse", () => {
    it("succeeds on ok response with success payload", async () => {
      const response = new Response(null, { status: 200 });
      const result = await Effect.runPromise(
        parseApiResponse<string>(response, { ok: true, data: "test" })
      );
      expect(result).toBe("test");
    });

    it("fails on non-ok response", async () => {
      const response = new Response(null, { status: 404 });
      const effect = parseApiResponse(response, { ok: false });

      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
    });

    it("fails with error details from payload", async () => {
      const response = new Response(null, { status: 400 });
      const effect = parseApiResponse(response, {
        ok: false,
        error: { code: "VALIDATION", message: "Invalid input", details: { field: "name" } },
      });

      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.code).toBe("VALIDATION");
        expect(result.left.status).toBe(400);
      }
    });
  });

  describe("tryFileRead", () => {
    it("reads file successfully", async () => {
      const mockReadFile = vi.fn().mockResolvedValue("file content");
      vi.doMock("node:fs/promises", () => ({
        readFile: mockReadFile,
      }));

      const result = await Effect.runPromise(tryFileRead("/test.txt"));
      expect(result).toBe("file content");
    });

    it("fails with FileSystemError on read failure", async () => {
      vi.doMock("node:fs/promises", () => ({
        readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
      }));

      const effect = tryFileRead("/missing.txt");
      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
    });
  });

  describe("tryFileWrite", () => {
    it("writes file with directory creation", async () => {
      const mockMkdir = vi.fn().mockResolvedValue(undefined);
      const mockWriteFile = vi.fn().mockResolvedValue(undefined);

      vi.doMock("node:fs/promises", () => ({
        mkdir: mockMkdir,
        writeFile: mockWriteFile,
      }));

      vi.doMock("node:path", () => ({
        dirname: vi.fn().mockReturnValue("/tmp"),
      }));

      await Effect.runPromise(tryFileWrite("/tmp/test.txt", "content"));
      expect(mockMkdir).toHaveBeenCalledWith("/tmp", { recursive: true });
    });
  });

  describe("tryParseJson", () => {
    it("parses valid JSON", async () => {
      const result = await Effect.runPromise(
        tryParseJson<{ name: string }>('{"name": "test"}', "data.json")
      );
      expect(result).toEqual({ name: "test" });
    });

    it("fails on invalid JSON", async () => {
      const effect = tryParseJson("invalid json", "data.json");
      const result = await Effect.runPromise(Effect.either(effect));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.operation).toBe("parse");
      }
    });
  });

  describe("runCliEffect", () => {
    it("resolves on success", async () => {
      const effect = Effect.succeed("result");
      const result = await runCliEffect(effect);
      expect(result).toBe("result");
    });

    it("rejects on failure", async () => {
      const effect = Effect.fail(new Error("failed"));
      await expect(runCliEffect(effect)).rejects.toThrow("failed");
    });
  });

  describe("runCliEffectWithErrorHandling", () => {
    it("returns value on success", async () => {
      const onError = vi.fn();
      const result = await runCliEffectWithErrorHandling(
        Effect.succeed("value"),
        { onError }
      );
      expect(result).toBe("value");
      expect(onError).not.toHaveBeenCalled();
    });

    it("returns null and calls onError on failure", async () => {
      const onError = vi.fn();
      const result = await runCliEffectWithErrorHandling(
        Effect.fail(new Error("fail")),
        { onError }
      );
      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
