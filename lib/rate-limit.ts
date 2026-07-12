/**
 * lib/rate-limit.ts
 * Lightweight fixed-window rate limiter backed by Upstash Redis.
 * If Upstash isn't configured (no env vars), checks are skipped rather than
 * failing the request — configure UPSTASH_REDIS_REST_URL / _TOKEN in production.
 */
import "server-only";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Returns { allowed: false } once `limit` calls for the same `key` have been
 * made within `windowSeconds`. Fails open (allowed: true) if Redis isn't configured.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    return { allowed: true, remaining: limit };
  }

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (err) {
    console.error("[rate-limit] Redis error, failing open:", err);
    return { allowed: true, remaining: limit };
  }
}
