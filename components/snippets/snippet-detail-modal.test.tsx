import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SnippetDetailModal } from "./snippet-detail-modal";

const {
  mockGetSnippet,
  mockGetAttachments,
  mockUpdateSnippet,
  mockDeleteSnippet,
  mockUploadAttachmentFilesToSnippet,
} = vi.hoisted(() => ({
  mockGetSnippet: vi.fn(),
  mockGetAttachments: vi.fn(),
  mockUpdateSnippet: vi.fn(),
  mockDeleteSnippet: vi.fn(),
  mockUploadAttachmentFilesToSnippet: vi.fn(async () => ({ failures: [] })),
}));

vi.mock("@/app/actions/snippets", () => ({
  getSnippet: mockGetSnippet,
  updateSnippet: mockUpdateSnippet,
  deleteSnippet: mockDeleteSnippet,
}));

vi.mock("@/app/actions/attachments", () => ({
  getAttachments: mockGetAttachments,
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

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button type="button" {...props}>{children}</button>,
  AlertDialogCancel: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button type="button" {...props}>{children}</button>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("./code-block", () => ({
  CodeBlock: () => <div>Code block</div>,
}));

vi.mock("./code-editor", () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <section aria-label="Code editor">
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </section>
  ),
}));

vi.mock("@/components/attachments/attachment-upload", () => ({
  AttachmentList: ({ attachments }: { attachments: Array<{ file_name: string }> }) => (
    <div>{attachments.map((attachment) => attachment.file_name).join(",")}</div>
  ),
}));

describe("SnippetDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSnippet.mockResolvedValue({
      success: true,
      snippet: {
        id: "snippet-1",
        title: "Snippet one",
        description: null,
        notes: null,
        language: "typescript",
        code: "const ok = true;",
        tags: ["demo"],
        created_at: "2026-04-01T00:00:00.000Z",
        updated_at: "2026-04-01T00:00:00.000Z",
      },
    });
    mockGetAttachments.mockResolvedValue({
      success: true,
      attachments: [],
    });
    mockUpdateSnippet.mockResolvedValue({ success: true });
    mockDeleteSnippet.mockResolvedValue({ success: true });
  });

  it("uploads attachments from edit mode", async () => {
    render(
      <SnippetDetailModal
        snippetId="snippet-1"
        open
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Snippet one")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput!, {
      target: {
        files: [new File(["hello"], "note.md", { type: "text/markdown" })],
      },
    });

    await waitFor(() => {
      expect(mockUploadAttachmentFilesToSnippet).toHaveBeenCalledWith(
        "snippet-1",
        expect.arrayContaining([expect.objectContaining({ name: "note.md" })]),
        expect.any(Function),
      );
    });
  });

  it("gives the destructive action an accessible name", async () => {
    render(
      <SnippetDetailModal
        snippetId="snippet-1"
        open
        onOpenChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Snippet one")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: "Delete snippet" })
    ).toBeInTheDocument();
  });
});
