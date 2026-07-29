import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_STORAGE_CONSTANTS,
  generateStorageKey,
  sanitizeFilename,
  validateFile,
} from "./storage";

describe("attachment storage helpers", () => {
  it("sanitizes filenames for storage", () => {
    expect(sanitizeFilename("../My File?.PDF")).toBe("my_file.pdf");
  });

  it("builds stable storage keys", () => {
    expect(generateStorageKey("user-1", "snippet-1", "file-1", "Demo File.txt"))
      .toBe("users/user-1/snippets/snippet-1/file-1-demo_file.txt");
  });

  it("validates allowed attachment metadata", () => {
    expect(validateFile({ size: 128, type: "text/plain" })).toBeNull();
    expect(validateFile({ size: 128, type: "image/svg+xml" })).toBeNull();
    expect(validateFile({ size: 128, type: "text/html" })).toBeNull();
    expect(validateFile({ size: 128, type: "text/css" })).toBeNull();
    expect(validateFile({ size: 128, type: "application/javascript" })).toBeNull();
    expect(validateFile({ size: ATTACHMENT_STORAGE_CONSTANTS.MAX_FILE_SIZE + 1, type: "text/plain" }))
      .toMatch(/File size exceeds 5MB limit/i);
    expect(validateFile({ size: 128, type: "application/x-msdownload" }))
      .toMatch(/not allowed/i);
  });
});
