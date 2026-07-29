import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { CacheError } from "@/lib/core/errors";
import { createSnippet, listSnippets } from "@/lib/core/services/snippets";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const MAX_TITLE_LENGTH = 200;
const MAX_CODE_LENGTH = 1_000_000;
const MAX_NOTES_LENGTH = 10_000;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

function validateSnippetInput(body: Record<string, unknown>) {
  if (typeof body.title !== "string" || body.title.length === 0) {
    throw new CacheError("validation_error", "title is required", 400);
  }
  if (body.title.length > MAX_TITLE_LENGTH) {
    throw new CacheError("validation_error", `title must be ${MAX_TITLE_LENGTH} characters or fewer`, 400);
  }
  if (typeof body.code !== "string" || body.code.length === 0) {
    throw new CacheError("validation_error", "code is required", 400);
  }
  if (body.code.length > MAX_CODE_LENGTH) {
    throw new CacheError("validation_error", `code must be ${MAX_CODE_LENGTH} characters or fewer`, 400);
  }
  if (body.description !== undefined && typeof body.description === "string" && body.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new CacheError("validation_error", `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`, 400);
  }
  if (body.notes !== undefined && typeof body.notes === "string" && body.notes.length > MAX_NOTES_LENGTH) {
    throw new CacheError("validation_error", `notes must be ${MAX_NOTES_LENGTH} characters or fewer`, 400);
  }
  if (Array.isArray(body.tags) && body.tags.length > MAX_TAGS) {
    throw new CacheError("validation_error", `Maximum ${MAX_TAGS} tags allowed`, 400);
  }
  if (Array.isArray(body.tags)) {
    for (const tag of body.tags) {
      if (typeof tag === "string" && tag.length > MAX_TAG_LENGTH) {
        throw new CacheError("validation_error", `Each tag must be ${MAX_TAG_LENGTH} characters or fewer`, 400);
      }
    }
  }
}

function readTags(searchParams: URLSearchParams) {
  const tags = searchParams.getAll("tag");
  if (tags.length > 0) {
    return tags;
  }

  const joinedTags = searchParams.get("tags");
  if (!joinedTags) {
    return undefined;
  }

  return joinedTags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));

      return yield* tryApiPromise(() =>
        listSnippets(context, {
          query: request.nextUrl.searchParams.get("query") ?? undefined,
          tags: readTags(request.nextUrl.searchParams),
        })
      );
    }),
    onSuccess: (snippets) => apiSuccess(snippets),
    onFailure: apiError,
  });
}

export async function POST(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));

      const clientId = getClientIdentifier(request, context.userId);
      const rl = checkRateLimit(`snippets:create:${clientId}`, 30, 60_000);
      if (!rl.allowed) {
        return yield* Effect.fail(
          new CacheError("rate_limited", "Too many snippet creation attempts", 429)
        );
      }

      let body: Record<string, unknown>;
      try {
        body = yield* tryApiPromise<Record<string, unknown>>(() => request.json());
      } catch {
        return yield* Effect.fail(new CacheError("validation_error", "Invalid JSON body", 400));
      }

      validateSnippetInput(body);

      return yield* tryApiPromise(() =>
        createSnippet(context, {
          title: body.title as string,
          description: typeof body.description === "string" ? body.description : undefined,
          notes: typeof body.notes === "string" ? body.notes : undefined,
          language: typeof body.language === "string" ? body.language : "",
          code: body.code as string,
          tags: Array.isArray(body.tags)
            ? body.tags.filter((value): value is string => typeof value === "string")
            : [],
        })
      );
    }),
    onSuccess: (snippet) => apiSuccess(snippet, 201),
    onFailure: apiError,
  });
}
