import { NextResponse } from "next/server";
import { CacheError, isCacheError } from "@/lib/core/errors";

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(error: CacheError) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    },
    { status: error.status }
  );
}

export function handleApiError(error: unknown) {
  if (isCacheError(error)) {
    return apiError(error);
  }

  if (error instanceof Error) {
    console.error("[api-error]", error);
    return apiError(new CacheError("internal_error", "An internal error occurred", 500));
  }

  return apiError(new CacheError("internal_error", "An internal error occurred", 500));
}
