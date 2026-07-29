import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit, logSecurityEvent, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/errors";
import { getApiContext } from "@/lib/api/auth";

type Handler = (req: NextRequest, userId: string) => Promise<Response>;

interface SecureHandlerOptions {
  requireAuth?: boolean;
  rateLimit?: {
    action: string;
    maxAttempts?: number;
    windowMinutes?: number;
  };
}

export function createSecureHandler(handler: Handler, options: SecureHandlerOptions = {}) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      if (options.rateLimit) {
        const identifier = getClientIdentifier(req);
        const key = `${options.rateLimit.action}:${identifier}`;
        const windowMs = (options.rateLimit.windowMinutes ?? 15) * 60 * 1000;
        const rateCheck = checkRateLimit(
          key,
          options.rateLimit.maxAttempts ?? 5,
          windowMs
        );

        if (!rateCheck.allowed) {
          await logSecurityEvent("rate_limit_exceeded", {
            action: options.rateLimit.action,
            ip: identifier,
          });

          return NextResponse.json(
            { error: "Too many requests", code: "RATE_LIMITED" },
            {
              status: 429,
              headers: {
                "Retry-After": String(rateCheck.retryAfterSeconds),
              },
            }
          );
        }
      }

      if (options.requireAuth !== false) {
        const context = await getApiContext(req);
        return handler(req, context.userId);
      }

      return handler(req, "");
    } catch (error) {
      const sanitized = sanitizeError(error);

      await logSecurityEvent("api_error", {
        path: req.nextUrl.pathname,
        method: req.method,
        error: sanitized.code,
      });

      return NextResponse.json(sanitized, { status: 500 });
    }
  };
}
