import { apiSuccess } from "@/lib/api/responses";

export async function GET() {
  return apiSuccess({
    service: "cache",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
