/**
 * lib/rate-limit.ts
 * Fixed-window rate limiter.
 *
 * Upstash Redis is used when it is configured. When it is not — which is the
 * case in this project today — the limiter falls back to Postgres rather than
 * skipping the check. It used to return `allowed: true` whenever Redis was
 * absent, which meant OTP send, login and password reset had no limit at all
 * and could be hammered indefinitely.
 *
 * Postgres is already a hard dependency of the app, so the fallback needs no new
 * environment variables and is always available.
 */
import "server-only";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/db";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export type RateLimitResult = { allowed: boolean; remaining: number };

/**
 * Returns { allowed: false } once `limit` calls for the same `key` have been
 * made within `windowSeconds`.
 *
 * A backend outage fails OPEN deliberately: the alternative is locking every
 * user out of login because the counter store is down. The case that mattered
 * — no backend configured at all — now uses Postgres instead of skipping.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
    } catch (err) {
      console.error("[rate-limit] Redis error, falling back to Postgres:", err);
      // fall through
    }
  }

  return checkViaPostgres(key, limit, windowSeconds);
}

/**
 * One statement, so concurrent requests cannot both read a stale count and each
 * decide they are under the limit. The CASE resets the counter when the previous
 * window has already expired, which is what makes this a fixed window rather
 * than a counter that only ever grows.
 */
async function checkViaPostgres(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const trimmed = key.slice(0, 200);
  try {
    const rows = await db.$queryRawUnsafe<{ count: number }[]>(
      `INSERT INTO "rate_limits" ("key", "count", "expiresAt")
       VALUES ($1, 1, now() + ($2 || ' seconds')::interval)
       ON CONFLICT ("key") DO UPDATE SET
         "count"     = CASE WHEN "rate_limits"."expiresAt" < now() THEN 1
                            ELSE "rate_limits"."count" + 1 END,
         "expiresAt" = CASE WHEN "rate_limits"."expiresAt" < now()
                            THEN now() + ($2 || ' seconds')::interval
                            ELSE "rate_limits"."expiresAt" END
       RETURNING "count"`,
      trimmed,
      String(windowSeconds),
    );

    const count = Number(rows?.[0]?.count ?? 0);

    // Opportunistic sweep so the table cannot grow without bound. Cheap because
    // it is indexed, and rare because it only runs on the first hit of a window.
    if (count === 1 && Math.random() < 0.02) {
      db.$executeRawUnsafe(`DELETE FROM "rate_limits" WHERE "expiresAt" < now() - interval '1 hour'`)
        .catch(() => {});
    }

    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (err) {
    // Same reasoning as above: a store outage must not lock everyone out.
    console.error("[rate-limit] Postgres error, failing open:", err);
    return { allowed: true, remaining: limit };
  }
}
