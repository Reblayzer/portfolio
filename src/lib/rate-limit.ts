import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: false,
    prefix: "contact",
  });
  return limiter;
}

export async function checkRateLimit(identifier: string): Promise<{ ok: boolean; remaining: number }> {
  const l = getLimiter();
  if (!l) {
    // In dev (no Upstash creds) we fail open with a warning.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[rate-limit] Upstash env vars missing, skipping rate limit (dev only).");
      return { ok: true, remaining: Infinity };
    }
    // In production this is a configuration error, fail closed.
    return { ok: false, remaining: 0 };
  }
  const result = await l.limit(identifier);
  return { ok: result.success, remaining: result.remaining };
}
