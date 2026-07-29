import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushSpy,
  refreshSpy,
  useSearchParamsSpy,
  getAuthSetupSpy,
  signInSpy,
  createOwnerSpy,
} = vi.hoisted(() => ({
  pushSpy: vi.fn(),
  refreshSpy: vi.fn(),
  useSearchParamsSpy: vi.fn(),
  getAuthSetupSpy: vi.fn(),
  signInSpy: vi.fn(),
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
    useSearchParams: () => useSearchParamsSpy(),
  };
});

vi.mock("@/app/actions/auth", () => ({
  getAuthSetup: getAuthSetupSpy,
  signIn: signInSpy,
  createOwner: createOwnerSpy,
}));

import SignInPage from "./page";

describe("SignInPage", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    pushSpy.mockReset();
    refreshSpy.mockReset();
    useSearchParamsSpy.mockReset();
    getAuthSetupSpy.mockReset();
    signInSpy.mockReset();
    createOwnerSpy.mockReset();

    useSearchParamsSpy.mockReturnValue(new URLSearchParams("callbackUrl=%2Fsettings"));
    getAuthSetupSpy.mockResolvedValue({ ownerExists: true, setupEnabled: true });
    signInSpy.mockResolvedValue({ success: true });
    createOwnerSpy.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows marketing deployment message instead of auth form", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_MODE", "marketing");

    render(<SignInPage />);

    expect(await screen.findByText("Marketing deployment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read local setup docs" })).toHaveAttribute("href", "/docs/getting-started/installation");
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
  });

  it("shows sign in mode when owner exists", async () => {
    render(<SignInPage />);

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Welcome back.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("blocks public bootstrap when instance is not initialized", async () => {
    getAuthSetupSpy.mockResolvedValue({ ownerExists: false, setupEnabled: true });

    render(<SignInPage />);

    expect(await screen.findByText("Instance setup required")).toBeInTheDocument();
    expect(screen.getByText("This deployment does not have an owner yet. Only the operator can initialize it.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Owner" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open setup" })).toHaveAttribute("href", "/setup");
  });

  it("signs in and redirects to safe callback", async () => {
    render(<SignInPage />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInSpy).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "SecurePass123!",
      });
    });

    expect(pushSpy).toHaveBeenCalledWith("/settings");
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to dashboard for unsafe callback URLs", async () => {
    useSearchParamsSpy.mockReturnValue(new URLSearchParams("callbackUrl=https%3A%2F%2Fevil.example.com"));

    render(<SignInPage />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows auth errors", async () => {
    signInSpy.mockResolvedValue({ success: false, error: "Invalid email or password" });

    render(<SignInPage />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
