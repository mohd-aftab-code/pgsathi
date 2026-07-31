-- Partner programme hardening: attribution, holds, clawbacks, TDS, tiers,
-- sub-partners, owner-to-owner referral and click tracking.
--
-- Written to be idempotent (IF NOT EXISTS / guarded DO blocks) because it is
-- applied by scripts/apply-migration.js one statement at a time, outside a
-- transaction, and a partial run must be fixable by simply running it again.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. users — owner-to-owner referral + forced password change
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referralRewardAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "partnerAttributedAt" TIMESTAMP(3);

-- Owners attributed before this column existed: start their commission clock at
-- account creation, which is the closest honest approximation.
UPDATE "users" SET "partnerAttributedAt" = "createdAt"
WHERE "partnerId" IS NOT NULL AND "partnerAttributedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "users_referredBy_idx" ON "users"("referredBy");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_referredBy_fkey') THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_referredBy_fkey"
      FOREIGN KEY ("referredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. plans — commission duration cap + two-sided referral bonus
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "partnerCommissionMonths" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "referralBonusDays" INTEGER NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. partner_profiles — KYC, risk flags, archive, commission controls, parent
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "kycVerifiedAt" TIMESTAMP(3);
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "kycVerifiedBy" INTEGER;
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "riskFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "riskReason" VARCHAR(300);
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "commissionOverridePercent" INTEGER;
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "tierOverride" VARCHAR(12);
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "parentPartnerId" INTEGER;
ALTER TABLE "partner_profiles" ADD COLUMN IF NOT EXISTS "parentOverridePercent" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "partner_profiles_parentPartnerId_idx" ON "partner_profiles"("parentPartnerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_profiles_parentPartnerId_fkey') THEN
    ALTER TABLE "partner_profiles"
      ADD CONSTRAINT "partner_profiles_parentPartnerId_fkey"
      FOREIGN KEY ("parentPartnerId") REFERENCES "partner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Partners approved before this migration were paid without a KYC check. Treat
-- an existing PAN + (UPI or full bank) as already verified so the new payout
-- gate does not freeze partners who are mid-cycle.
UPDATE "partner_profiles"
SET "kycVerifiedAt" = COALESCE("approvedAt", "createdAt")
WHERE "kycVerifiedAt" IS NULL
  AND "panNumber" IS NOT NULL
  AND (
    "upiId" IS NOT NULL
    OR ("bankAccountNo" IS NOT NULL AND "bankIfsc" IS NOT NULL AND "bankName" IS NOT NULL)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. partner_earnings — kind, derivation, holds, eligibility, rate snapshot
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "kind" VARCHAR(12) NOT NULL DEFAULT 'REFERRAL';
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "parentEarningId" INTEGER;
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "commissionRateSnapshot" VARCHAR(60);
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "onHold" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "holdReason" VARCHAR(200);
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "eligibleAt" TIMESTAMP(3);
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "autoApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "partner_earnings" ADD COLUMN IF NOT EXISTS "amountSetBy" INTEGER;

-- One OVERRIDE and one ADJUSTMENT per source earning. NULLs are distinct in
-- Postgres, so ordinary REFERRAL rows (parentEarningId NULL) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS "partner_earnings_parentEarningId_kind_key"
  ON "partner_earnings"("parentEarningId", "kind");

CREATE INDEX IF NOT EXISTS "partner_earnings_status_onHold_eligibleAt_idx"
  ON "partner_earnings"("status", "onHold", "eligibleAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_earnings_parentEarningId_fkey') THEN
    ALTER TABLE "partner_earnings"
      ADD CONSTRAINT "partner_earnings_parentEarningId_fkey"
      FOREIGN KEY ("parentEarningId") REFERENCES "partner_earnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Existing PENDING earnings predate the hold window. Backfill eligibleAt from
-- their creation date so they are immediately eligible rather than frozen.
UPDATE "partner_earnings"
SET "eligibleAt" = "createdAt"
WHERE "eligibleAt" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. partner_payouts — TDS breakdown, idempotency, reversal, maker-checker
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "grossAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "tdsRate" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "tdsAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "periodLabel" VARCHAR(10);
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(90);
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "proofUrl" TEXT;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "reversedAt" TIMESTAMP(3);
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "reversedBy" INTEGER;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "reverseReason" VARCHAR(300);
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "approvedBy" INTEGER;
ALTER TABLE "partner_payouts" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "partner_payouts_idempotencyKey_key"
  ON "partner_payouts"("idempotencyKey");

-- Payouts created before TDS existed were paid gross.
UPDATE "partner_payouts" SET "grossAmount" = "amount" WHERE "grossAmount" = 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. partner_program_settings — single-row programme config
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "partner_program_settings" (
  "id"                       INTEGER      NOT NULL DEFAULT 1,
  "holdDays"                 INTEGER      NOT NULL DEFAULT 7,
  "autoApproveEnabled"       BOOLEAN      NOT NULL DEFAULT true,
  "autoApproveMaxAmount"     INTEGER      NOT NULL DEFAULT 5000,
  "minPayoutAmount"          INTEGER      NOT NULL DEFAULT 500,
  "payoutDayOfMonth"         INTEGER      NOT NULL DEFAULT 5,
  "makerCheckerAbove"        INTEGER      NOT NULL DEFAULT 10000,
  "tdsEnabled"               BOOLEAN      NOT NULL DEFAULT false,
  "tdsRateWithPan"           INTEGER      NOT NULL DEFAULT 5,
  "tdsRateWithoutPan"        INTEGER      NOT NULL DEFAULT 20,
  "tdsThresholdYearly"       INTEGER      NOT NULL DEFAULT 15000,
  "goldAfterConversions"     INTEGER      NOT NULL DEFAULT 10,
  "platinumAfterConversions" INTEGER      NOT NULL DEFAULT 50,
  "goldBonusPercent"         INTEGER      NOT NULL DEFAULT 2,
  "platinumBonusPercent"     INTEGER      NOT NULL DEFAULT 5,
  "updatedAt"                TIMESTAMP(3) NOT NULL,
  "updatedBy"                INTEGER,
  CONSTRAINT "partner_program_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "partner_program_settings" ("id", "updatedAt")
VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. referral_clicks — attribution that survives the gap before signup
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "referral_clicks" (
  "id"              SERIAL       NOT NULL,
  "code"            VARCHAR(20)  NOT NULL,
  "partnerId"       INTEGER,
  "referrerUserId"  INTEGER,
  "landingPath"     VARCHAR(300),
  "ip"              VARCHAR(45),
  "userAgent"       VARCHAR(300),
  "utmSource"       VARCHAR(60),
  "utmMedium"       VARCHAR(60),
  "utmCampaign"     VARCHAR(60),
  "convertedUserId" INTEGER,
  "convertedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "referral_clicks_code_createdAt_idx"      ON "referral_clicks"("code", "createdAt");
CREATE INDEX IF NOT EXISTS "referral_clicks_partnerId_createdAt_idx" ON "referral_clicks"("partnerId", "createdAt");
CREATE INDEX IF NOT EXISTS "referral_clicks_convertedUserId_idx"     ON "referral_clicks"("convertedUserId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_clicks_partnerId_fkey') THEN
    ALTER TABLE "referral_clicks"
      ADD CONSTRAINT "referral_clicks_partnerId_fkey"
      FOREIGN KEY ("partnerId") REFERENCES "partner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. partner_leads — the partner's own pipeline before an owner exists
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "partner_leads" (
  "id"              SERIAL       NOT NULL,
  "partnerId"       INTEGER      NOT NULL,
  "name"            VARCHAR(120) NOT NULL,
  "phone"           VARCHAR(15)  NOT NULL,
  "city"            VARCHAR(100),
  "pgName"          VARCHAR(150),
  "stage"           VARCHAR(15)  NOT NULL DEFAULT 'NEW',
  "notes"           TEXT,
  "nextFollowUpAt"  TIMESTAMP(3),
  "convertedUserId" INTEGER,
  "convertedAt"     TIMESTAMP(3),
  "lostReason"      VARCHAR(200),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "partner_leads_partnerId_phone_key" ON "partner_leads"("partnerId", "phone");
CREATE INDEX IF NOT EXISTS "partner_leads_partnerId_stage_idx"        ON "partner_leads"("partnerId", "stage");
CREATE INDEX IF NOT EXISTS "partner_leads_nextFollowUpAt_idx"         ON "partner_leads"("nextFollowUpAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_leads_partnerId_fkey') THEN
    ALTER TABLE "partner_leads"
      ADD CONSTRAINT "partner_leads_partnerId_fkey"
      FOREIGN KEY ("partnerId") REFERENCES "partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
