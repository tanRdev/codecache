import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushSpy,
  refreshSpy,
  getAuthSetupSpy,
  createOwnerSpy,
} = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  refreshSpy: vi.fn(),
  getAuthSetupSpy: vi.fn(),
  createOwnerSpy: vi.fn(),
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    useRouter: () => ({
      push: pushSpy,
      refresh: refreshSpy,
    }),
  };
});

vi.mock("@/app/actions/auth", () => ({
  getAuthSetup: getAuthSetupSpy,
  createOwner: createOwnerSpy,
}));

import SetupPage from "./page";

describe("SetupPage", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    pushSpy.mockReset();
    refreshSpy.mockReset();
    getAuthSetupSpy.mockReset();
    createOwnerSpy.mockReset();

    getAuthSetupSpy.mockResolvedValue({ ownerExists: false, setupEnabled: true });
    createOwnerSpy.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows marketing deployment message instead of setup form", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    render(<SetupPage />);

    expect(await screen.findByText("Marketing deployment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read local setup docs" })).toHaveAttribute("href", "/docs/getting-started/installation");
    expect(screen.queryByRole("button", { name: "Create Owner" })).not.toBeInTheDocument();
  });

  it("shows operator setup form when instance is uninitialized", async () => {
    render(<SetupPage />);

    expect(await screen.findByText("Operator setup")).toBeInTheDocument();
    expect(screen.getByLabelText("Setup token")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Owner" })).toBeInTheDocument();
  });

  it("creates owner only from setup page with setup token", async () => {
    render(<SetupPage />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "VerySecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText("Setup token"), {
      target: { value: "setup-token-value" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Owner" }));

    await waitFor(() => {
      expect(createOwnerSpy).toHaveBeenCalledWith({
        email: "owner@example.com",
        password: "VerySecurePass123!",
        setupToken: "setup-token-value",
      });
    });

    expect(pushSpy).toHaveBeenCalledWith("/dashboard");
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });
});
