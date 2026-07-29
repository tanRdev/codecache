import { NextRequest, NextResponse } from "next/server";
import { Effect } from "effect";
import { requireBrowserSessionContext } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { createBrowserLoginExchange } from "@/lib/auth/browser-login";
import { createApiToken } from "@/lib/auth/api-tokens";
import { CacheError } from "@/lib/core/errors";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

function isAllowedCallback(callbackUrl: string) {
  try {
    const url = new URL(callbackUrl);
    return url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost");
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const callback = request.nextUrl.searchParams.get("callback");
      const name = request.nextUrl.searchParams.get("name")?.trim() || "CLI token";

      if (!callback || !isAllowedCallback(callback)) {
        return yield* Effect.fail(
          new CacheError("validation_error", "Callback must be a localhost loopback URL", 400)
        );
      }

      const context = yield* tryApiPromise(() => requireBrowserSessionContext());
      const token = yield* tryApiPromise(() => createApiToken(context.userId, name));
      const exchange = yield* tryApiPromise(() =>
        createBrowserLoginExchange({
          userId: context.userId,
          token: token.token,
          name: token.name,
        })
      );
      const redirectUrl = new URL(callback);
      redirectUrl.searchParams.set("code", exchange.code);

      return redirectUrl;
    }),
    onSuccess: (redirectUrl) => NextResponse.redirect(redirectUrl),
    onFailure: apiError,
  });
}
