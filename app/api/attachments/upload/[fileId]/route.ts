import { NextRequest, NextResponse } from "next/server";
import { Effect } from "effect";
import { CacheError } from "@/lib/core/errors";
import { requireBrowserSessionContextEffect } from "@/lib/effect/next-auth";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";
import * as sqlite from "@/lib/storage/sqlite";
import { MAX_ATTACHMENT_FILE_SIZE } from "@/lib/attachments/shared";
import { verifyFileContent } from "@/lib/attachments/content-sniff";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* requireBrowserSessionContextEffect();

      const clientId = getClientIdentifier(request, context.userId);
      const rl = checkRateLimit(`upload:${clientId}`, 20, 60_000);
      if (!rl.allowed) {
        return yield* Effect.fail(
          new CacheError("rate_limited", "Too many upload attempts", 429)
        );
      }

      const { fileId } = yield* tryApiPromise(() => params);
      const pendingUpload = yield* tryApiPromise(() =>
        sqlite.getPendingAttachmentUpload(context.userId, fileId)
      );

      if (!pendingUpload) {
        return yield* Effect.fail(new CacheError("not_found", "Upload session not found", 404));
      }

      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_ATTACHMENT_FILE_SIZE) {
        return yield* Effect.fail(
          new CacheError(
            "validation_error",
            `File size exceeds ${MAX_ATTACHMENT_FILE_SIZE / 1024 / 1024}MB limit`,
            413
          )
        );
      }

      const mimeType = request.headers.get("content-type") || "application/octet-stream";
      const content = new Uint8Array(yield* tryApiPromise(() => request.arrayBuffer()));

      if (content.byteLength > MAX_ATTACHMENT_FILE_SIZE) {
        return yield* Effect.fail(
          new CacheError(
            "validation_error",
            `File size exceeds ${MAX_ATTACHMENT_FILE_SIZE / 1024 / 1024}MB limit`,
            413
          )
        );
      }

      const sniffError = verifyFileContent(content, mimeType);
      if (sniffError) {
        return yield* Effect.fail(
          new CacheError("validation_error", sniffError, 400)
        );
      }

      yield* tryApiPromise(() =>
        sqlite.storeAttachmentBinary(
          context.userId,
          fileId,
          pendingUpload.storageKey,
          content
        )
      );
    }),
    onSuccess: () => new NextResponse(null, { status: 200 }),
    onFailure: (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  });
}
