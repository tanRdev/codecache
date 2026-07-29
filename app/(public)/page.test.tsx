import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LandingPage from "./page";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("LandingPage", () => {
  it("does not leave placeholder links in the public nav or ctas", () => {
    render(<LandingPage />);

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).not.toHaveAttribute("href", "#");
    });
  });

  it("avoids unearned social-proof copy in the hero and final cta", () => {
    render(<LandingPage />);

    expect(screen.queryByText(/Loved by developers shipping faster/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Join thousands of developers/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No credit card required/i)).not.toBeInTheDocument();
  });

  it("uses local-first product copy instead of pricing or managed hosting", () => {
    render(<LandingPage />);

    expect(screen.getByText(/Open source · local first/i)).toBeInTheDocument();
    expect(screen.getAllByText("Self-hosted").length).toBeGreaterThan(0);
    expect(screen.getByText("Browser, CLI, and API")).toBeInTheDocument();
    expect(screen.queryByText("Managed hosting")).not.toBeInTheDocument();
    expect(screen.queryByText("$5")).not.toBeInTheDocument();
    expect(screen.queryByText(/per month/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Get Started Free/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Sign in$/i })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByText(/Your personal code library/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Your personal code library, on your machine.",
      }),
    ).toBeInTheDocument();
  });

  it("sends the primary marketing action to installation docs", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    render(<LandingPage />);

    expect(screen.getByRole("link", { name: /install cache/i })).toHaveAttribute(
      "href",
      "/docs/getting-started/installation"
    );
    expect(screen.queryByRole("link", { name: /^Sign in$/i })).not.toBeInTheDocument();
  });
});
