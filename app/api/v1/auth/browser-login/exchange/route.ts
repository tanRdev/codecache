import { NextRequest } from "next/server";
import { Effect } from "effect";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { consumeBrowserLoginExchange } from "@/lib/auth/browser-login";
import { createValidationError } from "@/lib/core/errors";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

export async function POST(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const body = yield* tryApiPromise<Record<string, unknown>>(() => request.json());
      const code = typeof body.code === "string" ? body.code.trim() : "";

      if (!code) {
        return yield* Effect.fail(createValidationError("A browser login exchange code is required"));
      }

      return yield* tryApiPromise(() => consumeBrowserLoginExchange(code));
    }),
    onSuccess: (exchange) =>
      apiSuccess({
        name: exchange.name,
        token: exchange.token,
      }),
    onFailure: apiError,
  });
}
