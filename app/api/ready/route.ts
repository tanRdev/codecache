import { NextResponse } from "next/server";
import { getDb } from "@/lib/drizzle";
import { apiSuccess } from "@/lib/api/responses";

export async function GET() {
  try {
    const db = getDb();
    db.$client.prepare("SELECT 1 AS ready").get();

    return apiSuccess({
      status: "ready",
      checks: {
        database: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "service_unavailable",
          message: "Readiness checks failed",
        },
      },
      { status: 503 }
    );
  }
}
