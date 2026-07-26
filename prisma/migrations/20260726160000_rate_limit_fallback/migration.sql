-- Database-backed rate limiting.
--
-- lib/rate-limit.ts fails open when Upstash Redis is not configured, and it is
-- not configured here — so OTP send, login and password reset had no limit at
-- all and could be hammered indefinitely.
--
-- Postgres is already a hard dependency and is always available, so it can hold
-- the counters. This needs no new environment variables. Redis stays the
-- preferred backend when it is configured; this is the floor.
--
-- Applied with: npm run db:apply 20260726160000_rate_limit_fallback

CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key"       VARCHAR(200) PRIMARY KEY,
  "count"     INTEGER      NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

-- Sweeping expired rows is a range scan over this.
CREATE INDEX IF NOT EXISTS "rate_limits_expiresAt_idx" ON "rate_limits"("expiresAt");
