import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AttachmentDropzone } from "./attachment-dropzone";

describe("AttachmentDropzone", () => {
  it("queues selected files", () => {
    const onFilesSelected = vi.fn();

    render(
      <AttachmentDropzone
        files={[]}
        onFilesSelected={onFilesSelected}
      />,
    );

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: {
        files: [new File(["hello"], "note.md", { type: "text/markdown" })],
      },
    });

    expect(onFilesSelected).toHaveBeenCalledWith([
      expect.objectContaining({ name: "note.md" }),
    ]);
  });

  it("surfaces validation errors for unsupported files", () => {
    const onError = vi.fn();

    render(
      <AttachmentDropzone
        files={[]}
        onError={onError}
        onFilesSelected={vi.fn()}
      />,
    );

    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: {
        files: [new File(["hello"], "archive.zip", { type: "application/zip" })],
      },
    });

    expect(onError).toHaveBeenCalledWith(expect.stringContaining("archive.zip"));
  });

  it("renders queued files with remove actions", () => {
    const onRemoveFile = vi.fn();

    render(
      <AttachmentDropzone
        files={[{ id: "file-1", file: new File(["hello"], "note.md", { type: "text/markdown" }) }]}
        onFilesSelected={vi.fn()}
        onRemoveFile={onRemoveFile}
      />,
    );

    expect(screen.getByText("note.md")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove note\.md/i }));
    expect(onRemoveFile).toHaveBeenCalledWith("file-1");
  });
});
