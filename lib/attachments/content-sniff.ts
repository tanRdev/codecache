/**
 * Magic-byte file signature detection for common allowed MIME types.
 * Used to verify that uploaded file content matches the declared MIME type.
 */

interface FileSignature {
  mime: string;
  signatures: readonly (readonly number[])[];
}

const FILE_SIGNATURES: readonly FileSignature[] = [
  {
    mime: "image/jpeg",
    signatures: [
      [0xff, 0xd8, 0xff],
    ],
  },
  {
    mime: "image/png",
    signatures: [
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    ],
  },
  {
    mime: "image/gif",
    signatures: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
  },
  {
    mime: "image/webp",
    signatures: [
      [0x52, 0x49, 0x46, 0x46], // RIFF (need to also check WEBP at offset 8)
    ],
  },
  {
    mime: "application/pdf",
    signatures: [
      [0x25, 0x50, 0x44, 0x46], // %PDF
    ],
  },
];

function bytesMatch(signature: readonly number[], data: Uint8Array): boolean {
  if (data.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (data[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Detect the MIME type of a file from its magic bytes.
 * Returns the detected MIME type, or null if unknown.
 */
export function detectMimeType(content: Uint8Array): string | null {
  for (const { mime, signatures } of FILE_SIGNATURES) {
    for (const sig of signatures) {
      if (bytesMatch(sig, content)) {
        // Extra check for WEBP: verify "WEBP" at offset 8
        if (mime === "image/webp" && content.length >= 12) {
          const webpMarker = [0x57, 0x45, 0x42, 0x50]; // WEBP
          if (!bytesMatch(webpMarker, content.subarray(8, 12))) {
            continue;
          }
        }
        return mime;
      }
    }
  }

  return null;
}

/**
 * Verify that file content matches the declared MIME type.
 * Returns null if valid, or an error message if mismatch.
 */
export function verifyFileContent(
  content: Uint8Array,
  declaredMime: string
): string | null {
  // Skip sniffing for text-based types — they don't have magic bytes
  const textTypes = [
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
  ];

  if (textTypes.includes(declaredMime)) {
    return null;
  }

  const detected = detectMimeType(content);

  // Can't detect — allow it through (defense in depth: MIME allowlist already checked)
  if (!detected) {
    return null;
  }

  // Normalize for comparison (e.g., "image/jpg" vs "image/jpeg")
  const normalizedDeclared = declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;

  if (detected !== normalizedDeclared) {
    return `File content is ${detected}, but ${declaredMime} was declared`;
  }

  return null;
}
