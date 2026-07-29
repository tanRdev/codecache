import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";

export async function GET(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      return { userId: context.userId };
    }),
    onSuccess: (data) => apiSuccess(data),
    onFailure: apiError,
  });
}
