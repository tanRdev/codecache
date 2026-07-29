import { describe, expect, it } from "vitest";
import { resolveChoice } from "@/cli/interactive";

describe("interactive helpers", () => {
  it("resolves numeric and string choices", () => {
    expect(resolveChoice("2", ["one", "two"])).toBe("two");
    expect(resolveChoice("one", ["one", "two"])).toBe("one");
  });
});
