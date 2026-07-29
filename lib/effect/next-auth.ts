import { Effect } from "effect";
import { auth } from "@/lib/auth";
import { resolveApiToken } from "@/lib/auth/api-tokens";
import type { CacheContext } from "@/lib/core/context";
import { CacheError } from "@/lib/core/errors";
import { tryPromiseEffect } from "./server-actions";

interface HeaderLike {
  get(name: string): string | null;
}

interface RequestLike {
  headers: HeaderLike;
}

function readBearerToken(request: RequestLike) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, value] = authorization.split(" ");

  if (scheme !== "Bearer" || !value) {
    return null;
  }

  return value;
}

function unauthorized() {
  return new CacheError("unauthorized", "Unauthorized", 401);
}

function requireSessionUserEffect(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) {
    return Effect.fail(unauthorized());
  }

  return Effect.succeed<CacheContext>({ userId: session.user.id });
}

export function getApiContextEffect(request: RequestLike) {
  return Effect.gen(function* () {
    const bearerToken = readBearerToken(request);

    if (bearerToken) {
      const token = yield* tryPromiseEffect(() => resolveApiToken(bearerToken));

      if (!token) {
        return yield* Effect.fail(unauthorized());
      }

      return { userId: token.userId };
    }

    const session = yield* tryPromiseEffect(() => auth());
    return yield* requireSessionUserEffect(session);
  });
}

export function requireBrowserSessionContextEffect() {
  return Effect.gen(function* () {
    const session = yield* tryPromiseEffect(() => auth());
    return yield* requireSessionUserEffect(session);
  });
}

export function createNextRequestLike(headers?: Record<string, string>) {
  return {
    headers: {
      get(name: string) {
        return headers?.[name] ?? null;
      },
    },
  };
}
