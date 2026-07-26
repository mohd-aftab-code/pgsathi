-- Indexes on two columns the app filters by on almost every request but which
-- had no index, so Postgres was scanning the whole table each time.
--
--   pg_tenants."deletedAt"  — every tenant list, count, report and bill run
--                             filters `deletedAt IS NULL`.
--   listings.status         — every public search and city page filters status.
--
-- Applied with: npm run db:apply 20260726140000_hot_path_indexes

-- Partial index: the overwhelming majority of reads want the live rows, and a
-- partial index is smaller and faster than one covering every soft-deleted row.
CREATE INDEX IF NOT EXISTS "pg_tenants_active_idx"
  ON "pg_tenants"("ownerId", "listingId")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "pg_tenants_deletedAt_idx"
  ON "pg_tenants"("deletedAt");

-- listings.status alone is already served by the existing
-- (status, isVerified, isActive) index via its leftmost column, so no separate
-- index is created for it. City browse pages filter on city AND status together,
-- which that index cannot serve.
DROP INDEX IF EXISTS "listings_status_idx";

CREATE INDEX IF NOT EXISTS "listings_city_status_idx"
  ON "listings"("cityId", "status");
