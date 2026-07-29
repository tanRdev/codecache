import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DocsLayout from "./layout";

vi.mock("@/components/docs/docs-sidebar", () => ({
  DocsSidebar: function DocsSidebar() {
    return <div>Documentation sidebar</div>;
  },
}));

describe("DocsLayout", () => {
  it("renders a mobile navigation trigger for documentation", () => {
    render(
      <DocsLayout>
        <div>Docs content</div>
      </DocsLayout>
    );

    expect(screen.getByRole("button", { name: /open documentation navigation/i })).toBeInTheDocument();
    expect(screen.getByText("Docs content")).toBeInTheDocument();
  });
});
