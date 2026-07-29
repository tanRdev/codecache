import { describe, expect, it } from "vitest";
import { getInteractivePrompt, renderSessionStatus } from "@/cli/session";

describe("interactive shell session status", () => {
  it("shows login guidance when no profile is configured", () => {
    const output = renderSessionStatus({
      authenticated: false,
      identity: null,
      profile: null,
    });

    expect(output).toContain("Status: not configured");
    expect(output).toContain("Run /login");
  });

  it("shows current profile and identity when authenticated", () => {
    const output = renderSessionStatus({
      authenticated: true,
      identity: { userId: "user-1" },
      profile: {
        name: "remote",
        mode: "remote",
        appUrl: "https://cache.example.com",
        token: "secret",
      },
    });

    expect(output).toContain("Profile: remote");
    expect(output).toContain("Signed in: user-1");
    expect(output).toContain("Type /help");
  });

  it("builds a prompt that reflects profile and auth state", () => {
    expect(
      getInteractivePrompt({
        authenticated: false,
        identity: null,
        profile: null,
      })
    ).toBe("> ");

    expect(
      getInteractivePrompt({
        authenticated: true,
        identity: { userId: "user-1" },
        profile: {
          name: "remote",
          mode: "remote",
          appUrl: "https://cache.example.com",
          token: "secret",
        },
      })
    ).toBe("> ");
  });
});
