interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > 10 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
}

/**
 * In-process, per-instance rate limiter. Counters live in this Node.js process
 * only: they reset on restart and are not shared across instances, so
 * multi-instance deployments must enforce limits at the load balancer or
 * reverse proxy instead. The limiter fails closed: any unexpected error is
 * treated as "limit exceeded".
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  try {
    const entry = store.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        retryAfterSeconds: 0,
        resetAt: new Date(now + windowMs),
      };
    }

    if (entry.count >= maxAttempts) {
      const retryAfterMs = windowMs - (now - entry.windowStart);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        resetAt: new Date(entry.windowStart + windowMs),
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      retryAfterSeconds: 0,
      resetAt: new Date(entry.windowStart + windowMs),
    };
  } catch {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      resetAt: new Date(now + windowMs),
    };
  }
}

export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  return `ip:${ip}`;
}

export async function logSecurityEvent(eventType: string, details: Record<string, unknown> = {}) {
  void eventType;
  void details;
  return null;
}
