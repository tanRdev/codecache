import { describe, expect, it } from "vitest";
import {
  completeShellInput,
  getSlashCommandSuggestions,
  listSlashCommands,
  renderShellHelp,
  resolveShellInput,
  tokenizeShellInput,
} from "@/cli/shell";

describe("interactive shell helpers", () => {
  it("tokenizes quoted shell input", () => {
    expect(tokenizeShellInput('/snippet create --title "Test Snippet" --tag demo')).toEqual([
      "/snippet",
      "create",
      "--title",
      "Test Snippet",
      "--tag",
      "demo",
    ]);
  });

  it("maps slash aliases onto existing CLI commands", () => {
    expect(resolveShellInput("/login")).toEqual({
      kind: "command",
      argv: ["auth", "login"],
    });

    expect(resolveShellInput("/snippet list auth")).toEqual({
      kind: "command",
      argv: ["snippet", "list", "auth"],
    });

    expect(resolveShellInput("/snippets auth")).toEqual({
      kind: "command",
      argv: ["snippet", "list", "auth"],
    });

    expect(resolveShellInput("/snippet create ./README.md --title \"Docs\"")).toEqual({
      kind: "command",
      argv: ["snippet", "create", "./README.md", "--title", "Docs"],
    });

    expect(resolveShellInput("/exit")).toEqual({
      kind: "builtin",
      builtin: "exit",
    });

    expect(resolveShellInput("/status")).toEqual({
      kind: "builtin",
      builtin: "status",
    });
  });

  it("offers slash command suggestions by prefix", () => {
    expect(getSlashCommandSuggestions("/sn")).toEqual(
      expect.arrayContaining(["/snippet create", "/snippet list", "/snippets"])
    );
  });

  it("renders grouped shell help", () => {
    const help = renderShellHelp();

    expect(help).toContain("/login");
    expect(help).toContain("/snippet create");
    expect(help).toContain("/attachment add");
    expect(help).toContain("/storage validate");
    expect(help).toContain("Press Tab after typing /");
  });

  it("provides tab completion results for slash prefixes", () => {
    const [suggestions, completed] = completeShellInput("/lo");

    expect(completed).toBe("/lo");
    expect(suggestions).toContain("/login");
  });

  it("lists available slash commands for UI suggestions", () => {
    expect(listSlashCommands()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ invocation: "/login", group: "Auth" }),
        expect.objectContaining({ invocation: "/snippet create", group: "Snippets" }),
      ])
    );
  });
});
