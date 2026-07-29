import type { NextRequest } from "next/server";
import type { CacheContext } from "@/lib/core/context";
import {
  getApiContextEffect,
  requireBrowserSessionContextEffect,
} from "@/lib/effect/next-auth";
import { Effect } from "effect";

export async function getApiContext(request: NextRequest): Promise<CacheContext> {
  return Effect.runPromise(getApiContextEffect(request));
}

export async function requireBrowserSessionContext(): Promise<CacheContext> {
  return Effect.runPromise(requireBrowserSessionContextEffect());
}
