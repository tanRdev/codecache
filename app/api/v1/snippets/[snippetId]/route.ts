import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { CacheError } from "@/lib/core/errors";
import { deleteSnippet, getSnippet, updateSnippet } from "@/lib/core/services/snippets";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

const MAX_TITLE_LENGTH = 200;
const MAX_CODE_LENGTH = 1_000_000;
const MAX_NOTES_LENGTH = 10_000;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

function validateSnippetPatch(body: Record<string, unknown>) {
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.length === 0) {
      throw new CacheError("validation_error", "title must be a non-empty string", 400);
    }
    if (body.title.length > MAX_TITLE_LENGTH) {
      throw new CacheError("validation_error", `title must be ${MAX_TITLE_LENGTH} characters or fewer`, 400);
    }
  }
  if (body.code !== undefined) {
    if (typeof body.code !== "string") {
      throw new CacheError("validation_error", "code must be a string", 400);
    }
    if (body.code.length > MAX_CODE_LENGTH) {
      throw new CacheError("validation_error", `code must be ${MAX_CODE_LENGTH} characters or fewer`, 400);
    }
  }
  if (body.description !== undefined && typeof body.description === "string" && body.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new CacheError("validation_error", `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`, 400);
  }
  if (body.notes !== undefined && typeof body.notes === "string" && body.notes.length > MAX_NOTES_LENGTH) {
    throw new CacheError("validation_error", `notes must be ${MAX_NOTES_LENGTH} characters or fewer`, 400);
  }
  if (Array.isArray(body.tags)) {
    if (body.tags.length > MAX_TAGS) {
      throw new CacheError("validation_error", `Maximum ${MAX_TAGS} tags allowed`, 400);
    }
    for (const tag of body.tags) {
      if (typeof tag === "string" && tag.length > MAX_TAG_LENGTH) {
        throw new CacheError("validation_error", `Each tag must be ${MAX_TAG_LENGTH} characters or fewer`, 400);
      }
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const { snippetId } = yield* tryApiPromise(() => params);
      return yield* tryApiPromise(() => getSnippet(context, snippetId));
    }),
    onSuccess: (snippet) => apiSuccess(snippet),
    onFailure: apiError,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));

      let body: Record<string, unknown>;
      try {
        body = yield* tryApiPromise<Record<string, unknown>>(() => request.json());
      } catch {
        return yield* Effect.fail(new CacheError("validation_error", "Invalid JSON body", 400));
      }

      const { snippetId } = yield* tryApiPromise(() => params);

      validateSnippetPatch(body);

      return yield* tryApiPromise(() =>
        updateSnippet(context, snippetId, {
          title: typeof body.title === "string" ? body.title : undefined,
          description: typeof body.description === "string" ? body.description : undefined,
          notes: typeof body.notes === "string" ? body.notes : undefined,
          language: typeof body.language === "string" ? body.language : undefined,
          code: typeof body.code === "string" ? body.code : undefined,
          tags: Array.isArray(body.tags)
            ? body.tags.filter((value): value is string => typeof value === "string")
            : undefined,
        })
      );
    }),
    onSuccess: (result) => apiSuccess(result),
    onFailure: apiError,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      const { snippetId } = yield* tryApiPromise(() => params);
      return yield* tryApiPromise(() => deleteSnippet(context, snippetId));
    }),
    onSuccess: (result) => apiSuccess(result),
    onFailure: apiError,
  });
}
