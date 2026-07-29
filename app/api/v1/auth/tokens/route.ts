import { NextRequest } from "next/server";
import { Effect } from "effect";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { requireBrowserSessionContext } from "@/lib/api/auth";
import { createApiToken } from "@/lib/auth/api-tokens";
import { CacheError } from "@/lib/core/errors";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => requireBrowserSessionContext());

      const clientId = getClientIdentifier(request, context.userId);
      const rl = checkRateLimit(`tokens:${clientId}`, 10, 60_000);
      if (!rl.allowed) {
        return yield* Effect.fail(
          new CacheError("rate_limited", "Too many token creation attempts", 429)
        );
      }

      const body: Record<string, unknown> = yield* Effect.catchAll(
        tryApiPromise<Record<string, unknown>>(() => request.json()),
        () => Effect.succeed({})
      );
      const name = typeof body.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 100)
        : "CLI token";

      return yield* tryApiPromise(() => createApiToken(context.userId, name));
    }),
    onSuccess: (token) => apiSuccess(token, 201),
    onFailure: apiError,
  });
}
