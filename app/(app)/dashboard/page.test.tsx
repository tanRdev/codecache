import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

vi.mock("@/components/snippets", () => ({
  SnippetCard: () => null,
  SearchInput: () => null,
  TagFilter: () => null,
}));

vi.mock("@/components/storage-badge", () => ({
  StorageBadge: ({ backend }: { backend: string }) => <div>{backend}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/core/services/snippets", () => ({
  listSnippets: vi.fn(() => []),
  getUserTags: vi.fn(() => []),
}));

describe("dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authenticated dashboard content", async () => {
    const page = await DashboardPage({ searchParams: Promise.resolve({ q: "auth" }) });

    expect(page).toBeTruthy();
  });
});
