-- One Razorpay payment can only ever create one subscription.
--
-- The checkout callback and the payment webhook can both fire for the same
-- payment. The webhook's "already recorded?" lookup is not atomic, so without
-- this index a race creates two subscriptions — and therefore two partner
-- commissions — for a single payment.
--
-- NULLs are exempt from a Postgres unique index, so the free-plan and legacy
-- rows that carry no payment id are unaffected.
--
-- Applied with: node scripts/apply-migration.js 20260726090000_unique_razorpay_payment
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_razorpayPaymentId_key"
  ON "subscriptions"("razorpayPaymentId");
