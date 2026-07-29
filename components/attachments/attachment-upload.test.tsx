import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AttachmentList, AttachmentUpload, AttachmentsPanel } from "./attachment-upload";
import type { Attachment } from "@/lib/db";

vi.mock("@/app/actions/attachments", () => ({
  getPresignedUploadUrl: vi.fn(),
  saveAttachmentMetadata: vi.fn(),
  deleteAttachment: vi.fn(),
  getAttachments: vi.fn(),
  getAttachmentDownloadUrl: vi.fn(),
}));

const mockWindowOpen = vi.fn();
vi.stubGlobal("open", mockWindowOpen);

import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  getAttachments,
  getPresignedUploadUrl,
  saveAttachmentMetadata,
} from "@/app/actions/attachments";

const mockDeleteAttachment = vi.mocked(deleteAttachment);
const mockGetAttachmentDownloadUrl = vi.mocked(getAttachmentDownloadUrl);
const mockGetAttachments = vi.mocked(getAttachments);
const mockGetPresignedUploadUrl = vi.mocked(getPresignedUploadUrl);
const mockSaveAttachmentMetadata = vi.mocked(saveAttachmentMetadata);

describe("AttachmentList", () => {
  const mockImageAttachment: Attachment = {
    id: "img-1",
    snippet_id: "snippet-1",
    storage_key: "users/user-1/snippets/snippet-1/img-1-test.png",
    file_name: "test-image.png",
    file_size: 1024 * 100,
    mime_type: "image/png",
    created_at: "2024-01-01T00:00:00Z",
  };

  const mockPdfAttachment: Attachment = {
    id: "pdf-1",
    snippet_id: "snippet-1",
    storage_key: "users/user-1/snippets/snippet-1/pdf-1-doc.pdf",
    file_name: "document.pdf",
    file_size: 1024 * 500,
    mime_type: "application/pdf",
    created_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAttachmentDownloadUrl.mockResolvedValue({
      success: true,
      url: "https://example.com/signed-url",
    });
  });

  describe("with empty attachments", () => {
    it("returns null when no attachments", () => {
      const { container } = render(<AttachmentList attachments={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("with image attachments", () => {
    it("renders image section header", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment]} />);
      });

      expect(screen.getByRole("heading", { name: "Images" })).toBeInTheDocument();
    });

    it("displays image file name", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment]} />);
      });

      expect(screen.getByText("test-image.png")).toBeInTheDocument();
    });

    it("displays file size", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment]} />);
      });

      expect(screen.getByText("100.0 KB")).toBeInTheDocument();
    });

    it("fetches signed URL for image preview on mount", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment]} />);
      });

      await waitFor(() => {
        expect(mockGetAttachmentDownloadUrl).toHaveBeenCalledWith(mockImageAttachment.id);
      });
    });

    it("displays loading spinner while fetching URL", async () => {
      mockGetAttachmentDownloadUrl.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment]} />);
      });

      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("with non-image attachments", () => {
    it("renders files section header for non-image attachments", () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);
      expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    });

    it("displays file name", () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    it("displays file size and extension metadata", () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);
      expect(screen.getByText("PDF · 500.0 KB")).toBeInTheDocument();
    });

    it("calls getAttachmentDownloadUrl when View is clicked", async () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);

      fireEvent.click(screen.getByRole("button", { name: "View" }));

      await waitFor(() => {
        expect(mockGetAttachmentDownloadUrl).toHaveBeenCalledWith(mockPdfAttachment.id);
      });
    });

    it("opens file in new tab on View click", async () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);

      fireEvent.click(screen.getByRole("button", { name: "View" }));

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          "https://example.com/signed-url",
          "_blank",
          "noopener,noreferrer",
        );
      });
    });
  });

  describe("with mixed attachments", () => {
    it("renders both images and files sections", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment, mockPdfAttachment]} />);
      });

      expect(screen.getByRole("heading", { name: "Images" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    });

    it("separates images and files into different sections", async () => {
      await act(async () => {
        render(<AttachmentList attachments={[mockImageAttachment, mockPdfAttachment]} />);
      });

      expect(screen.getByText("test-image.png")).toBeInTheDocument();
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });
  });

  describe("delete functionality", () => {
    it("shows delete confirmation dialog", () => {
      render(<AttachmentList attachments={[mockPdfAttachment]} />);

      fireEvent.click(screen.getByRole("button", { name: `Delete ${mockPdfAttachment.file_name}` }));

      expect(screen.getByText("Delete Attachment")).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });

    it("calls deleteAttachment when confirmed", async () => {
      mockDeleteAttachment.mockResolvedValue({ success: true });

      render(<AttachmentList attachments={[mockPdfAttachment]} />);

      fireEvent.click(screen.getByRole("button", { name: `Delete ${mockPdfAttachment.file_name}` }));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(mockDeleteAttachment).toHaveBeenCalledWith(mockPdfAttachment.id);
      });
    });

    it("removes attachment from list after successful delete", async () => {
      mockDeleteAttachment.mockResolvedValue({ success: true });

      render(<AttachmentList attachments={[mockPdfAttachment]} />);

      fireEvent.click(screen.getByRole("button", { name: `Delete ${mockPdfAttachment.file_name}` }));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(screen.queryByText("document.pdf")).not.toBeInTheDocument();
      });
    });
  });
});

describe("AttachmentUpload", () => {
  const mockSnippetId = "snippet-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload button", () => {
    render(<AttachmentUpload snippetId={mockSnippetId} />);
    expect(screen.getByRole("button", { name: /upload file/i })).toBeInTheDocument();
  });

  it("shows file size limit hint", () => {
    render(<AttachmentUpload snippetId={mockSnippetId} />);
    expect(screen.getByText("Max 5 MB · images, PDF, text, code")).toBeInTheDocument();
  });

  it("shows validation error for oversized files", async () => {
    render(<AttachmentUpload snippetId={mockSnippetId} />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File([new Uint8Array(MAX_SAFE_FILE_BYTES)], "too-large.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });

    await act(async () => {
      fireEvent.change(input!, { target: { files: [file] } });
    });

    expect(screen.getByText(/File size exceeds 5MB limit/)).toBeInTheDocument();
  });

  it("uploads a valid file and reports completion", async () => {
    const onUploadComplete = vi.fn();
    mockGetPresignedUploadUrl.mockResolvedValue({
      success: true,
      uploadUrl: "https://example.com/upload",
      storageKey: "test-key",
      fileId: "new-file-id",
    });
    mockSaveAttachmentMetadata.mockResolvedValue({ success: true });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true })
    );

    render(<AttachmentUpload snippetId={mockSnippetId} onUploadComplete={onUploadComplete} />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File(["hello"], "note.md", { type: "text/markdown" });

    await act(async () => {
      fireEvent.change(input!, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockGetPresignedUploadUrl).toHaveBeenCalledWith({
        snippetId: mockSnippetId,
        fileName: "note.md",
        fileSize: file.size,
        mimeType: "text/markdown",
      });
    });

    await waitFor(() => {
      expect(mockSaveAttachmentMetadata).toHaveBeenCalled();
      expect(onUploadComplete).toHaveBeenCalled();
    });
  });
});

describe("AttachmentsPanel", () => {
  const mockSnippetId = "snippet-1";
  const mockAttachments: Attachment[] = [
    {
      id: "img-1",
      snippet_id: mockSnippetId,
      storage_key: "users/user-1/snippets/snippet-1/img-1-test.png",
      file_name: "test.png",
      file_size: 1024,
      mime_type: "image/png",
      created_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAttachmentDownloadUrl.mockResolvedValue({
      success: true,
      url: "https://example.com/signed-url",
    });
  });

  it("renders upload component", () => {
    render(<AttachmentsPanel snippetId={mockSnippetId} initialAttachments={[]} />);
    expect(screen.getByRole("button", { name: /upload file/i })).toBeInTheDocument();
  });

  it("renders attachment list with initial attachments", async () => {
    await act(async () => {
      render(<AttachmentsPanel snippetId={mockSnippetId} initialAttachments={mockAttachments} />);
    });

    expect(screen.getByText("test.png")).toBeInTheDocument();
  });

  it("hides an attachment after delete without syncing props into local state", async () => {
    mockDeleteAttachment.mockResolvedValue({ success: true });

    await act(async () => {
      render(<AttachmentList attachments={mockAttachments} />);
    });

    fireEvent.click(screen.getByRole("button", { name: `Delete ${mockAttachments[0].file_name}` }));

    const confirmDeleteButton = await screen.findByRole("button", { name: "Delete" });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText("test.png")).not.toBeInTheDocument();
    });
  });

  it("refreshes attachments after upload callback", async () => {
    mockGetAttachments.mockResolvedValue({
      success: true,
      attachments: [
        ...mockAttachments,
        {
          id: "new-file-id",
          snippet_id: mockSnippetId,
          storage_key: "test-key",
          file_name: "new-file.png",
          file_size: 2048,
          mime_type: "image/png",
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    });

    mockGetPresignedUploadUrl.mockResolvedValue({
      success: true,
      uploadUrl: "https://example.com/upload",
      storageKey: "test-key",
      fileId: "new-file-id",
    });

    mockSaveAttachmentMetadata.mockResolvedValue({ success: true });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true })
    );

    await act(async () => {
      render(<AttachmentsPanel snippetId={mockSnippetId} initialAttachments={mockAttachments} />);
    });

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File(["image"], "new-file.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(input!, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockGetAttachments).toHaveBeenCalledWith(mockSnippetId);
    });

    await waitFor(() => {
      expect(screen.getByText("new-file.png")).toBeInTheDocument();
    });
  });
});

const MAX_SAFE_FILE_BYTES = 1024;
