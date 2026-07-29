import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { createValidationError } from "@/lib/core/errors";
import { listSnippetAttachments, uploadAttachment } from "@/lib/core/services/attachments";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const { snippetId } = yield* tryApiPromise(() => params);
      return yield* tryApiPromise(() => listSnippetAttachments(context, snippetId));
    }),
    onSuccess: (attachments) => apiSuccess(attachments),
    onFailure: apiError,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const form = yield* tryApiPromise(() => request.formData());
      const file = form.get("file");
      const mimeTypeValue = form.get("mimeType");
      const { snippetId } = yield* tryApiPromise(() => params);

      if (!(file instanceof File)) {
        return yield* Effect.fail(createValidationError("A file upload is required"));
      }

      const mimeType = typeof mimeTypeValue === "string" && mimeTypeValue
        ? mimeTypeValue
        : file.type || "application/octet-stream";
      const fileBuffer = yield* tryApiPromise(() => file.arrayBuffer());

      return yield* tryApiPromise(() =>
        uploadAttachment(context, {
          snippetId,
          fileName: file.name,
          fileSize: file.size,
          mimeType,
          content: new Uint8Array(fileBuffer),
        })
      );
    }),
    onSuccess: (attachment) => apiSuccess(attachment, 201),
    onFailure: apiError,
  });
}
