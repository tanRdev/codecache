import { describe, expect, it } from "vitest";
import {
  buildBrowserLoginUrl,
  openBrowser,
  shouldAutoOpenBrowser,
  startAuthCallbackServer,
  startAuthCallbackServerEffect,
  openBrowserEffect,
} from "@/cli/browser-auth";
import { Effect } from "effect";

describe("browser-auth Effect", () => {
  describe("buildBrowserLoginUrl", () => {
    it("should build the browser auth URL correctly", () => {
      const loginUrl = buildBrowserLoginUrl(
        "http://localhost:3000",
        "http://127.0.0.1:4567/callback",
        "remote"
      );

      expect(loginUrl).toBe(
        "http://localhost:3000/auth/cli?callback=http%3A%2F%2F127.0.0.1%3A4567%2Fcallback&name=remote"
      );
    });

    it("should handle empty name", () => {
      const loginUrl = buildBrowserLoginUrl(
        "http://localhost:3000",
        "http://127.0.0.1:4567/callback",
        "  "
      );

      expect(loginUrl).toBe(
        "http://localhost:3000/auth/cli?callback=http%3A%2F%2F127.0.0.1%3A4567%2Fcallback"
      );
    });
  });

  describe("shouldAutoOpenBrowser", () => {
    it("defaults to auto-open disabled", () => {
      expect(shouldAutoOpenBrowser()).toBe(false);
    });

    it("respects the no-browser flag", () => {
      expect(shouldAutoOpenBrowser()).toBe(false);
    });
  });

  describe("startAuthCallbackServerEffect", () => {
    it("should start server and capture exchange code from callback", async () => {
      const program = startAuthCallbackServerEffect(5000);

      const session = await Effect.runPromise(program);

      expect(session.callbackUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/callback$/);

      const response = await fetch(`${session.callbackUrl}?code=exchange_code_123`);
      const body = await response.text();

      expect(body).toContain("Cache CLI login complete");

      const code = await session.codePromise;
      expect(code).toBe("exchange_code_123");

      await session.close();
    });

    it("should fail with timeout when no callback received", async () => {
      const program = startAuthCallbackServerEffect(100); // 100ms timeout

      const session = await Effect.runPromise(program);

      await expect(session.codePromise).rejects.toThrow("Timed out");

      await session.close();
    });

    it("should handle missing code in callback", async () => {
      const program = startAuthCallbackServerEffect(5000);

      const session = await Effect.runPromise(program);

      const response = await fetch(session.callbackUrl);
      expect(response.status).toBe(400);

      await expect(session.codePromise).rejects.toThrow("No exchange code provided");

      await new Promise((resolve) => setTimeout(resolve, 50));

      await session.close();
    });

    it("should handle wrong path", async () => {
      const program = startAuthCallbackServerEffect(5000);

      const session = await Effect.runPromise(program);

      const response = await fetch(`${session.callbackUrl}/wrong`);
      expect(response.status).toBe(404);

      await session.close();
    });
  });

  describe("startAuthCallbackServer (original)", () => {
    it("should still work with original Promise-based API", async () => {
      const session = await startAuthCallbackServer(5000);

      expect(session.callbackUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/callback$/);

      const response = await fetch(`${session.callbackUrl}?code=legacy_exchange_code`);
      const body = await response.text();
      const code = await session.codePromise;

      expect(body).toContain("Cache CLI login complete");
      expect(code).toBe("legacy_exchange_code");

      await session.close();
    });
  });

  describe("openBrowserEffect", () => {
    it("fails because browser auto-open is disabled", async () => {
      const effect = openBrowserEffect("http://localhost:3000/auth/cli");
      const result = await Effect.runPromise(Effect.either(effect));

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.message).toContain("Browser auto-open is disabled");
      }
    });

    it("throws when openBrowser is called directly", async () => {
      await expect(openBrowser("http://localhost:3000/auth/cli")).rejects.toThrow(
        "Browser auto-open is disabled"
      );
    });
  });
});
