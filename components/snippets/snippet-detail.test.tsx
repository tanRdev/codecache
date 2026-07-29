import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SnippetDetail } from "./snippet-detail";
import type { Attachment } from "@/lib/db";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/actions/snippets", () => ({
  deleteSnippet: vi.fn(),
  updateSnippet: vi.fn(),
}));

vi.mock("./code-block", () => ({
  CodeBlock: ({ code }: { code: string }) => <div>{code}</div>,
}));

vi.mock("./code-editor", () => ({
  CodeEditor: () => <div>Editor</div>,
}));

vi.mock("@/components/attachments/attachment-upload", () => ({
  AttachmentsPanel: ({ snippetId }: { snippetId: string }) => <div>Attachments panel {snippetId}</div>,
}));

describe("SnippetDetail", () => {
  const snippet = {
    id: "snippet-1",
    user_id: "user-1",
    title: "Snippet title",
    description: "Snippet description",
    notes: "Usage notes",
    language: "typescript",
    code: "const ready = true;",
    search_text: "Snippet title Snippet description Usage notes",
    created_at: "2026-03-30T00:00:00.000Z",
    updated_at: "2026-03-30T01:00:00.000Z",
    tags: ["typescript", "demo"],
  };

  const attachments: Attachment[] = [
    {
      id: "attachment-1",
      snippet_id: "snippet-1",
      storage_key: "users/user-1/snippets/snippet-1/attachment-1-demo.txt",
      file_name: "demo.txt",
      file_size: 42,
      mime_type: "text/plain",
      created_at: "2026-03-30T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the attachments panel in the main snippet view", () => {
    render(
      <SnippetDetail
        snippet={snippet}
        storageBackend="sqlite"
        initialAttachments={attachments}
      />
    );

    expect(screen.getByText("Attachments panel snippet-1")).toBeInTheDocument();
    expect(
      screen.queryByText(/add attachments here to keep screenshots/i)
    ).not.toBeInTheDocument();
  });

  it("uses product-facing copy in edit mode", () => {
    render(
      <SnippetDetail
        snippet={snippet}
        storageBackend="sqlite"
        initialAttachments={attachments}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(
      screen.getByText(
        "Changes update this snippet across the browser, CLI, and API.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/refresh flow/i)).not.toBeInTheDocument();
  });
});
