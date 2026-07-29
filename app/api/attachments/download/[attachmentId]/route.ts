import { NextRequest, NextResponse } from "next/server";
import { Effect } from "effect";
import { CacheError } from "@/lib/core/errors";
import { requireBrowserSessionContextEffect } from "@/lib/effect/next-auth";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";
import * as sqlite from "@/lib/storage/sqlite";

function createContentDisposition(fileName: string) {
  // Strip CRLF and control characters to prevent header injection
  const safe = fileName.replace(/[\r\n]/g, "_").replace(/\p{Cc}/gu, "_");
  const encodedName = encodeURIComponent(safe);
  return `attachment; filename="${safe}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* requireBrowserSessionContextEffect();
      const { attachmentId } = yield* tryApiPromise(() => params);
      const target = yield* tryApiPromise(() =>
        sqlite.getAttachmentDownloadTarget(context.userId, attachmentId)
      );

      if (!target || target.kind !== "blob" || !target.contentBase64) {
        return yield* Effect.fail(new CacheError("not_found", "Attachment not found", 404));
      }

      return {
        contentBase64: target.contentBase64,
        fileName: target.fileName,
        mimeType: target.mimeType,
      };
    }),
    onSuccess: (target) => {
      const content = Buffer.from(target.contentBase64, "base64");

      return new NextResponse(new Uint8Array(content), {
        status: 200,
        headers: {
          "Content-Type": target.mimeType ?? "application/octet-stream",
          "Content-Disposition": createContentDisposition(target.fileName ?? "download"),
          "Cache-Control": "private, no-store",
        },
      });
    },
    onFailure: (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  });
}
