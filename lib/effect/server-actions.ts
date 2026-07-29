import { revalidatePath } from "next/cache";
import { Data, Effect, Either } from "effect";
import { auth } from "@/lib/auth";
import { isCacheError } from "@/lib/core/errors";

export class UnauthorizedActionError extends Data.TaggedError("UnauthorizedActionError")<{
  readonly reason: string;
}> {}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Failed to resolve the current session");
}

export function requireUserIdEffect(message: string) {
  return Effect.tryPromise({
    try: () => auth(),
    catch: toError,
  }).pipe(
    Effect.flatMap((session) => {
      const userId = session?.user?.id;

      if (!userId) {
        return Effect.fail(new UnauthorizedActionError({ reason: message }));
      }

      return Effect.succeed(userId);
    })
  );
}

export function revalidatePathsEffect(paths: ReadonlyArray<string>) {
  return Effect.sync(() => {
    for (const path of paths) {
      revalidatePath(path);
    }
  });
}

export function tryPromiseEffect<Value>(operation: () => Promise<Value>) {
  return Effect.tryPromise({
    try: operation,
    catch: (error) => error,
  });
}

export function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof UnauthorizedActionError) {
    return error.reason;
  }

  if (isCacheError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getRateLimitedDetails(error: unknown) {
  if (!isCacheError(error) || error.code !== "rate_limited") {
    return {};
  }

  const resetAt = error.details?.resetAt;

  return {
    rateLimited: true,
    resetAt: typeof resetAt === "number" ? resetAt : undefined,
  };
}

export function createActionFailure(error: unknown, fallback: string) {
  return {
    success: false,
    error: getActionErrorMessage(error, fallback),
    ...getRateLimitedDetails(error),
  };
}

export async function runServerAction<Success, Failure, Result>(options: {
  effect: Effect.Effect<Success, Failure>;
  onSuccess: (value: Success) => Result;
  onFailure: (error: Failure) => Result;
}): Promise<Result> {
  const result = await Effect.runPromise(Effect.either(options.effect));

  if (Either.isRight(result)) {
    return options.onSuccess(result.right);
  }

  return options.onFailure(result.left);
}
