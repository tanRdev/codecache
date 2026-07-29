import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { deleteAttachment, getAttachmentDownload } from "@/lib/core/services/attachments";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

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
    onSuccess: (result) => apiSuccess(result),
    onFailure: apiError,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const { attachmentId } = yield* tryApiPromise(() => params);
      return yield* tryApiPromise(() => deleteAttachment(context, attachmentId));
    }),
    onSuccess: (result) => apiSuccess(result),
    onFailure: apiError,
  });
}
