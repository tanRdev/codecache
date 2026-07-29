import { describe, expect, it } from "vitest";
import {
  formatBanner,
  formatHelpPanel,
  formatShellFrame,
  formatSuggestions,
  formatSuggestionsBelowInput,
} from "@/cli/ui";

describe("cli ui", () => {
  it("renders a richer launch banner", () => {
    const banner = formatBanner().join("\n");
    expect(banner).toContain("CACHE");
    expect(banner).toContain("Primary command: cache");
  });

  it("renders inline suggestions with descriptions", () => {
    const lines = formatSuggestions("/snip");
    expect(lines.join("\n")).toContain("/snippet create");
    expect(lines.join("\n")).toContain("Create a snippet");
  });

  it("shows slash suggestions immediately when the user types /", () => {
    const lines = formatSuggestions("/");
    expect(lines.join("\n")).toContain("/login");
    expect(lines.join("\n")).toContain("/snippet create");
  });

  it("renders a grouped help panel", () => {
    const lines = formatHelpPanel();
    expect(lines.join("\n")).toContain("Slash Commands");
    expect(lines.join("\n")).toContain("Auth");
    expect(lines.join("\n")).toContain("/login");
  });

  it("renders a full shell frame without suggestions", () => {
    const lines = formatShellFrame(
      "/snippet",
      {
        authenticated: false,
        identity: null,
        profile: null,
      },
      []
    );

    expect(lines.join("\n")).toContain("Not configured");
    expect(lines.join("\n")).not.toContain("/snippet create");
    expect(lines.join("\n")).not.toContain("Slash commands");
  });

  it("renders suggestions below input when typing /", () => {
    const suggestions = formatSuggestionsBelowInput("/snippet");
    expect(suggestions.join("\n")).toContain("/snippet create");
    expect(suggestions.join("\n")).toContain("Slash commands");
  });

  it("returns empty array for suggestions below input when not typing /", () => {
    expect(formatSuggestionsBelowInput("hello")).toEqual([]);
  });

  it("hides slash suggestions until the user types /", () => {
    expect(formatSuggestions("hello")).toEqual([]);
  });
});
