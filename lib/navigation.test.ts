import { describe, expect, it } from "vitest";
import { getSafeRedirectTarget } from "./navigation";

describe("getSafeRedirectTarget", () => {
  it("keeps same-origin paths, queries, and fragments", () => {
    expect(
      getSafeRedirectTarget("/snippets/snippet-1?view=expanded#notes"),
    ).toBe("/snippets/snippet-1?view=expanded#notes");
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "/..//evil.example/steal",
    "/%2e%2e//evil.example/steal",
    "dashboard",
  ])("rejects unsafe callback %s", (callbackUrl) => {
    expect(getSafeRedirectTarget(callbackUrl)).toBe("/dashboard");
  });

  it("uses the requested fallback for missing callbacks", () => {
    expect(getSafeRedirectTarget(null, "/")).toBe("/");
  });
});
