-- Partner recurring commission — owner-anchored, one commission per payment.
--
-- `prisma migrate` cannot run on this project (no DIRECT_URL; Neon's pooled
-- endpoint can't serve migrations), so this file is applied by
-- scripts/apply-migration.js. Every statement is idempotent and safe to re-run.

-- 1. Longer billing cycles. Enum values must be added outside a transaction and
--    before anything references them.
ALTER TYPE "BillingCycle" ADD VALUE IF NOT EXISTS 'QUARTERLY' BEFORE 'YEARLY';
ALTER TYPE "BillingCycle" ADD VALUE IF NOT EXISTS 'HALF_YEARLY' BEFORE 'YEARLY';

-- 2. Per-cycle plan pricing. NULL = that cycle is not offered for the plan.
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "quarterlyPrice"  INTEGER;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "halfYearlyPrice" INTEGER;

-- 3. Owner → partner attribution. Set on the first partner touch, never changed.
--    SET NULL so removing a partner never deletes the owners they brought in.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "partnerId" INTEGER;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_partnerId_fkey') THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_partnerId_fkey"
      FOREIGN KEY ("partnerId") REFERENCES "partner_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "users_partnerId_idx" ON "users"("partnerId");

-- 4. Invoices become the billing record commission is calculated from.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "periodStart" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "periodEnd"   TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "invoices_invoiceDate_idx" ON "invoices"("invoiceDate");

-- 5. partner_earnings: re-anchor from (partner, PG) to (owner, invoice).
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "ownerId"   INTEGER;
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "invoiceId" INTEGER;

-- An owner-level commission belongs to no single PG, so listingId must be optional.
ALTER TABLE "partner_earnings" ALTER COLUMN "listingId" DROP NOT NULL;

-- THE key change: this index capped each PG at one lifetime earning and is what
-- made recurring commission impossible.
DROP INDEX IF EXISTS "partner_earnings_partnerId_listingId_key";

-- One payment can only ever produce one commission.
CREATE UNIQUE INDEX IF NOT EXISTS "partner_earnings_invoiceId_key"
  ON "partner_earnings"("invoiceId");
CREATE INDEX IF NOT EXISTS "partner_earnings_ownerId_idx"
  ON "partner_earnings"("ownerId");

-- listingId now SET NULL rather than CASCADE: deleting a PG must not erase the
-- commission history of money that was already earned and possibly paid.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_earnings_listingId_fkey') THEN
    ALTER TABLE "partner_earnings" DROP CONSTRAINT "partner_earnings_listingId_fkey";
  END IF;
  ALTER TABLE "partner_earnings" ADD CONSTRAINT "partner_earnings_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "listings"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_earnings_ownerId_fkey') THEN
    ALTER TABLE "partner_earnings" ADD CONSTRAINT "partner_earnings_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_earnings_invoiceId_fkey') THEN
    ALTER TABLE "partner_earnings" ADD CONSTRAINT "partner_earnings_invoiceId_fkey"
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Backfill. Existing earnings were created per-PG, so derive the owner from
--    the PG and stamp the same attribution onto the owner record. Nothing is
--    deleted and no amounts change.
UPDATE "partner_earnings" e
   SET "ownerId" = l."ownerId"
  FROM "listings" l
 WHERE e."listingId" = l."id" AND e."ownerId" IS NULL;

UPDATE "users" u
   SET "partnerId" = first_partner.pid
  FROM (
    SELECT l."ownerId" AS uid, MIN(l."partnerId") AS pid
      FROM "listings" l
     WHERE l."partnerId" IS NOT NULL
     GROUP BY l."ownerId"
  ) AS first_partner
 WHERE u."id" = first_partner.uid AND u."partnerId" IS NULL;
