import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateSnippetModal } from "./create-snippet-modal";

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

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("./code-editor", () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <section aria-label="Code editor">
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </section>
  ),
}));

describe("CreateSnippetModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the new snippet detail page after save", async () => {
    const onOpenChange = vi.fn();
    const { createSnippet } = await import("@/app/actions/snippets");

    render(<CreateSnippetModal open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByPlaceholderText("Snippet title"), {
      target: { value: "Modal snippet" },
    });

    const codeEditor = screen.getByRole("region", { name: /code editor/i });
    fireEvent.change(codeEditor.querySelector("textarea") ?? codeEditor, {
      target: { value: "const modal = true;" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(createSnippet).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Modal snippet" }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith("/snippets/snippet-123");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("uploads queued attachments after saving the snippet", async () => {
    render(<CreateSnippetModal open onOpenChange={vi.fn()} />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput!, {
      target: {
        files: [new File(["hello"], "note.md", { type: "text/markdown" })],
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Snippet title"), {
      target: { value: "Modal snippet" },
    });

    const codeEditor = screen.getByRole("region", { name: /code editor/i });
    fireEvent.change(codeEditor.querySelector("textarea") ?? codeEditor, {
      target: { value: "const modal = true;" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUploadAttachmentFilesToSnippet).toHaveBeenCalledWith(
        "snippet-123",
        expect.arrayContaining([expect.objectContaining({ name: "note.md" })]),
        expect.any(Function),
      );
    });
  });
});
