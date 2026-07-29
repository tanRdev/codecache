import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SnippetDetailPage from "./page";

const {
  mockGetAttachments,
  mockAuth,
  mockGetSnippetById,
} = vi.hoisted(() => ({
  mockGetAttachments: vi.fn(),
  mockAuth: vi.fn(),
  mockGetSnippetById: vi.fn(),
}));

vi.mock("@/components/snippets", () => ({
  SnippetDetail: () => <div>Snippet detail</div>,
}));

vi.mock("@/app/actions/attachments", () => ({
  getAttachments: mockGetAttachments,
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/core/services/snippets", () => ({
  getSnippetById: mockGetSnippetById,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("snippet detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetSnippetById.mockResolvedValue({ id: "snippet-1" });
    mockGetAttachments.mockResolvedValue({ success: true, attachments: [] });
  });

  it("renders snippet detail page", async () => {
    const page = await SnippetDetailPage({ params: Promise.resolve({ id: "snippet-1" }) });
    render(page);

    expect(screen.getByText("Snippet detail")).toBeInTheDocument();
  });
});
