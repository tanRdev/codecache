import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "./account-menu";

const logoutButtonSpy = vi.fn();

vi.mock("@/components/logout-button", () => ({
  LogoutButton: ({ onLoggedOut, className }: { onLoggedOut?: () => void; className?: string }) => (
    <button
      type="button"
      className={className}
      onClick={() => {
        logoutButtonSpy();
        onLoggedOut?.();
      }}
    >
      Sign out
    </button>
  ),
}));

describe("AccountMenu", () => {
  beforeEach(() => {
    logoutButtonSpy.mockReset();
  });

  it("opens the account menu and shows sign out action", () => {
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("closes the menu after logout", () => {
    render(<AccountMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(logoutButtonSpy).toHaveBeenCalledTimes(1);
  });
});
