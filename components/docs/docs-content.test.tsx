import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocsContent } from "./docs-content";

describe("DocsContent", () => {
  it("omits the markdown page title already rendered by the docs shell", () => {
    render(
      <DocsContent
        content={"# Installation\n\nStart here.\n\n## Requirements\n\nNode.js"}
      />,
    );

    expect(
      screen.queryByRole("heading", { level: 1, name: "Installation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Requirements" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Start here.")).toBeInTheDocument();
  });
});
