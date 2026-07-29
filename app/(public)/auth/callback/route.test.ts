import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

describe("auth callback route", () => {
  it("always redirects back to sign-in with callback error", async () => {
    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost:3000/auth/callback?code=test-code&callbackUrl=/dashboard"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/sign-in?error=callback");
  });
});
