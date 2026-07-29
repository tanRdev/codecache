import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { getAttachmentDownload } from "@/lib/core/services/attachments";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

function createContentDisposition(fileName: string) {
  // Strip CRLF and control characters to prevent header injection
  const safe = fileName.replace(/[\r\n]/g, "_").replace(/\p{Cc}/gu, "_");
  const encodedName = encodeURIComponent(safe);
  return `attachment; filename="${safe}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const { attachmentId } = yield* tryApiPromise(() => params);
      return yield* tryApiPromise(() => getAttachmentDownload(context, attachmentId));
    }),
    onSuccess: (target) => {
      if (target.kind === "blob" && target.contentBase64) {
        const content = Buffer.from(target.contentBase64, "base64");

        return new NextResponse(content, {
          status: 200,
          headers: {
            "Content-Type": target.mimeType ?? "application/octet-stream",
            "Content-Disposition": createContentDisposition(target.fileName ?? "download"),
            "Cache-Control": "private, no-store",
          },
        });
      }

      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Attachment not found" } },
        { status: 404 }
      );
    },
    onFailure: apiError,
  });
}
