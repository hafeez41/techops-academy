/**
 * Simple sliding-window rate limiter using an in-memory Map.
 * Works per serverless instance. Suitable for preventing casual abuse.
 * For strict multi-instance limiting, replace with Upstash Redis.
 */

interface Window {
  count: number;
  reset: number; // epoch ms when the window resets
}

const store = new Map<string, Window>();

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Purge expired entries occasionally to avoid memory leaks
  if (Math.random() < 0.01) {
    for (const [k, w] of store.entries()) {
      if (w.reset < now) store.delete(k);
    }
  }

  const entry = store.get(key);

  if (!entry || entry.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.reset };
  }

  return { success: true, remaining: limit - entry.count, reset: entry.reset };
}

/**
 * Extract a stable identifier from a request for rate-limit keying.
 * Uses IP from x-forwarded-for (set by Vercel) or falls back to a fixed key.
 */
export function getRequestKey(req: Request, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:${ip}`;
}
