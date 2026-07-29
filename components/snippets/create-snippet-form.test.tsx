import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateSnippetForm } from "./create-snippet-form";

const { mockPush, mockUploadAttachmentFilesToSnippet } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUploadAttachmentFilesToSnippet: vi.fn(async () => ({ failures: [] })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/actions/snippets", () => ({
  createSnippet: vi.fn(async () => ({ success: true, snippetId: "snippet-123" })),
}));

vi.mock("@/lib/attachments/client", () => ({
  uploadAttachmentFilesToSnippet: mockUploadAttachmentFilesToSnippet,
}));

vi.mock("./code-editor", () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <section aria-label="Code editor">
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </section>
  ),
}));

describe("CreateSnippetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<CreateSnippetForm />);

    expect(screen.getByRole("region", { name: /code editor/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByText(/drop files here now\. we will save the snippet first, then attach these files automatically/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<CreateSnippetForm />);

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it("normalizes and adds tags from the tags input", () => {
    render(<CreateSnippetForm />);

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.change(screen.getByRole("region", { name: /code editor/i }).querySelector("textarea") ?? screen.getByRole("region", { name: /code editor/i }), {
      target: { value: "const x = 1;" },
    });
    fireEvent.click(submitButton);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "Test snippet" } });

    const tagInput = screen.getByLabelText(/tags/i);

    fireEvent.change(tagInput, { target: { value: "  React  " } });
    fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(tagInput).toHaveValue("");
  });

  it("redirects to the new snippet detail page after a local save", async () => {
    const { createSnippet } = await import("@/app/actions/snippets");

    render(<CreateSnippetForm />);

    const codeEditor = screen.getByRole("region", { name: /code editor/i });
    fireEvent.change(codeEditor.querySelector("textarea") ?? codeEditor, {
      target: { value: "const created = true;" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    const titleInput = await screen.findByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "Created snippet" } });

    fireEvent.click(screen.getByRole("button", { name: /save snippet/i }));

    await waitFor(() => {
      expect(createSnippet).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Created snippet" }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith("/snippets/snippet-123");
  });

  it("uploads queued attachments after the snippet is created", async () => {
    const { createSnippet } = await import("@/app/actions/snippets");

    render(<CreateSnippetForm />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    await waitFor(() => {
      fireEvent.change(fileInput!, {
        target: {
          files: [new File(["hello"], "note.md", { type: "text/markdown" })],
        },
      });
    });

    const codeEditor = screen.getByRole("region", { name: /code editor/i });
    fireEvent.change(codeEditor.querySelector("textarea") ?? codeEditor, {
      target: { value: "const created = true;" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    const titleInput = await screen.findByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "Created snippet" } });
    fireEvent.click(screen.getByRole("button", { name: /save snippet/i }));

    await waitFor(() => {
      expect(createSnippet).toHaveBeenCalled();
      expect(mockUploadAttachmentFilesToSnippet).toHaveBeenCalledWith(
        "snippet-123",
        expect.arrayContaining([expect.objectContaining({ name: "note.md" })]),
        expect.any(Function),
      );
    });
  });
});
