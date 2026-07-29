import { describe, expect, it, vi } from "vitest";
import { defineOpusMonacoTheme } from "./code-editor";

describe("defineOpusMonacoTheme", () => {
  it("registers the custom theme through monaco.editor.defineTheme", () => {
    const defineTheme = vi.fn();

    defineOpusMonacoTheme({
      editor: {
        defineTheme,
      },
    });

    expect(defineTheme).toHaveBeenCalledOnce();
    expect(defineTheme).toHaveBeenCalledWith(
      "opus-dark",
      expect.objectContaining({
        base: "vs-dark",
        inherit: true,
      })
    );
  });
});
