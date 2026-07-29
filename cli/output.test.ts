import { describe, expect, it, vi, afterEach } from "vitest";
import { printSuccess, renderSuccess, resolveOutputFormat } from "@/cli/output";

describe("cli output", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to human format for TTY sessions", () => {
    expect(resolveOutputFormat(undefined, true)).toBe("human");
    expect(resolveOutputFormat(undefined, false)).toBe("json");
  });

  it("renders snippet lists in a human-readable form", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    printSuccess(
      [
        {
          id: "snippet-1",
          title: "Answer",
          language: "typescript",
          tags: ["math", "demo"],
        },
      ],
      "human"
    );

    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringContaining("Answer")
    );
    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringContaining("snippet-1")
    );
  });

  it("masks secret fields in human-readable output", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    printSuccess(
      {
        name: "remote",
        token: "cache_pat_secret",
      },
      "human"
    );

    expect(writeSpy).toHaveBeenCalledWith(
      expect.not.stringContaining("cache_pat_secret")
    );
    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringContaining("[hidden]")
    );
  });

  it("can render output without printing it", () => {
    const result = renderSuccess({ name: "remote", token: "secret" }, "human");

    expect(result).toContain("remote");
    expect(result).toContain("[hidden]");
    expect(result).not.toContain("secret");
  });
});
