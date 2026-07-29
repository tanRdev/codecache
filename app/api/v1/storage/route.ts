import { NextRequest } from "next/server";
import { Effect } from "effect";
import { getApiContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/responses";
import { createValidationError } from "@/lib/core/errors";
import { runApiRoute, tryApiPromise } from "@/lib/effect/api-routes";
import { getEffectiveStorageSettings } from "@/lib/storage/settings";
import type { StorageBackend } from "@/lib/storage/types";

function parseStorageBackend(value: unknown): StorageBackend {
  if (value === "sqlite") {
    return value;
  }

  throw createValidationError("Unsupported storage backend");
}

export async function GET(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const context = yield* tryApiPromise(() => getApiContext(request));
      return yield* tryApiPromise(() => getEffectiveStorageSettings(context.userId));
    }),
    onSuccess: (settings) => apiSuccess(settings),
    onFailure: apiError,
  });
}

export async function POST(request: NextRequest) {
  return runApiRoute({
    effect: Effect.gen(function* () {
      const body = yield* tryApiPromise<Record<string, unknown>>(() => request.json());
      yield* tryApiPromise(async () => {
        parseStorageBackend(body.backend);
      });
      return {
        success: true,
        message: "SQLite storage is always enabled",
      };
    }),
    onSuccess: (result) => apiSuccess(result),
    onFailure: apiError,
  });
}
