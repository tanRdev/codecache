import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitemap", () => {
  it("includes docs and public routes in the generated sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000");
    expect(urls).toContain("http://localhost:3000/docs");
    expect(urls).toContain("http://localhost:3000/docs/getting-started");
    expect(urls).toContain("http://localhost:3000/docs/getting-started/installation");
    expect(urls).toContain("http://localhost:3000/sign-in");
    expect(urls).toContain("http://localhost:3000/setup");
  });

  it("omits unavailable account routes in marketing mode", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/docs");
    expect(urls).not.toContain("http://localhost:3000/sign-in");
    expect(urls).not.toContain("http://localhost:3000/setup");
  });
});
