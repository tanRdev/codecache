import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUsePathname, mockPush, mockRefresh, mockSignOutAction } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSignOutAction: vi.fn(async () => undefined),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/app/actions/auth", () => ({
  signOutAction: mockSignOutAction,
}));

vi.mock("@/components/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/cache-brand", () => ({
  CacheMark: () => <div>Cache</div>,
}));

vi.mock("@/components/sqlite-status", () => ({
  SqliteStatus: () => <div>SQLite connected</div>,
}));

import AppLayout from "./layout";

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("renders sidebar nav and content", () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText("SQLite connected")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("signs out and redirects to sign in", async () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /sign out/i })[0]);
    });

    expect(mockSignOutAction).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/sign-in");
  });
});
