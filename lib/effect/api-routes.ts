import { Effect } from "effect";
import { CacheError, isCacheError } from "@/lib/core/errors";
import { runServerAction, tryPromiseEffect } from "./server-actions";

function toApiError(error: unknown) {
  if (isCacheError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Never leak raw error messages to clients — they may contain
    // SQL fragments, file paths, hostnames, or connection strings.
    console.error("[api-error]", error);
    return new CacheError("internal_error", "An internal error occurred", 500);
  }

  return new CacheError("internal_error", "An internal error occurred", 500);
}

export function tryApiPromise<Value>(operation: () => Promise<Value>) {
  return tryPromiseEffect(operation);
}

export async function runApiRoute<Success>(options: {
  effect: Effect.Effect<Success, unknown>;
  onSuccess: (value: Success) => Response;
  onFailure: (error: CacheError) => Response;
}): Promise<Response> {
  return runServerAction<Success, unknown, Response>({
    effect: options.effect,
    onSuccess: options.onSuccess,
    onFailure: (error) => options.onFailure(toApiError(error)),
  });
}
