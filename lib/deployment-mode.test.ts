import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDeploymentMode, isMarketingDeployment } from "./deployment-mode";

describe("deployment mode", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to full deployment", () => {
    expect(getDeploymentMode()).toBe("full");
    expect(isMarketingDeployment()).toBe(false);
  });

  it("recognizes marketing deployment from public env", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    expect(getDeploymentMode()).toBe("marketing");
    expect(isMarketingDeployment()).toBe(true);
  });
});
