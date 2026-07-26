/* End-to-end proof that partner commission is owner-wise and RECURRING.
 *
 * Run with the dev server up:  npm run check:commission
 * Needs browsers once:        npx playwright install chromium
 *
 * Drives the real /api/subscription route as a logged-in owner (with genuine
 * Razorpay signatures computed from RAZORPAY_KEY_SECRET), then checks the
 * database. The decisive assertion is that a SECOND payment by the same owner
 * earns a SECOND commission — that was impossible before, because
 * @@unique([partnerId, listingId]) capped each PG at one lifetime earning.
 *
 * Creates its own tagged fixture and removes it afterwards, including leftovers
 * from a run that died mid-way.
 */
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const BASE = "http://localhost:3000";
const TAG = "ZZTMP-RECUR";
const OWNER_PHONE = "9000000291";
// Generated per run, never committed. This repository is public, and the fixture
// below is a real account on the live database — if the script dies before its
// cleanup runs, a hardcoded password here would be a working login for anyone.
const OWNER_PASS = "Tmp" + crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "") + "1!";
const PLAN_SLUG = "zztmp-recur-plan";

function mkClient() {
  const base = process.env.DATABASE_URL;
  const url = base + (base.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=60";
  return new PrismaClient({ datasources: { db: { url } } });
}

async function withDb(fn, attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    const db = mkClient();
    try { return await fn(db); }
    catch (e) {
      if (i === attempts) throw e;
      await new Promise((r) => setTimeout(r, 4000));
    } finally { await db.$disconnect().catch(() => {}); }
  }
}

let pass = 0, fail = 0;
const issues = [];
const check = (l, ok, d = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${d ? "  — " + d : ""}`);
  if (ok) pass++; else { fail++; issues.push(l + (d ? " (" + d + ")" : "")); }
};

async function cleanup() {
  return withDb(async (db) => {
    const uids = (await db.user.findMany({
      where: { OR: [{ name: { startsWith: TAG } }, { email: { startsWith: "zztmp-recur" } }] },
      select: { id: true },
    })).map((u) => u.id);
    const pids = uids.length
      ? (await db.partnerProfile.findMany({ where: { userId: { in: uids } }, select: { id: true } })).map((p) => p.id)
      : [];

    if (uids.length) {
      // Earnings reference invoices; invoices reference subscriptions. Unlink then
      // delete in dependency order.
      await db.partnerEarning.updateMany({ where: { ownerId: { in: uids } }, data: { payoutId: null } });
      await db.partnerEarning.deleteMany({ where: { ownerId: { in: uids } } });
      if (pids.length) {
        await db.partnerEarning.updateMany({ where: { partnerId: { in: pids } }, data: { payoutId: null } });
        await db.partnerPayout.deleteMany({ where: { partnerId: { in: pids } } });
        await db.partnerEarning.deleteMany({ where: { partnerId: { in: pids } } });
        await db.partnerActivityLog.deleteMany({ where: { partnerId: { in: pids } } });
        await db.partnerSetting.deleteMany({ where: { partnerId: { in: pids } } });
      }
      const subIds = (await db.subscription.findMany({ where: { userId: { in: uids } }, select: { id: true } })).map((s) => s.id);
      await db.invoice.deleteMany({ where: { subscriptionId: { in: subIds } } });
      await db.subscription.deleteMany({ where: { userId: { in: uids } } });
      await db.user.updateMany({ where: { id: { in: uids } }, data: { partnerId: null } });
      if (pids.length) await db.partnerProfile.deleteMany({ where: { id: { in: pids } } });
      await db.notification.deleteMany({ where: { userId: { in: uids } } });
      await db.user.deleteMany({ where: { id: { in: uids } } });
    }
    await db.plan.deleteMany({ where: { slug: PLAN_SLUG } });
    return true;
  }).catch((e) => { console.log("cleanup error:", e.message.split("\n")[0]); return false; });
}

const sign = (orderId, payId) =>
  crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${payId}`).digest("hex");

(async () => {
  await cleanup();

  let fixture;
  try {
    fixture = await withDb(async (db) => {
      const hash = await bcrypt.hash(OWNER_PASS, 10);
      const pUser = await db.user.create({
        data: { name: TAG + " Partner", email: "zztmp-recur-p@pgsathi.test", phone: "9000000290", passwordHash: hash, role: "PARTNER", isVerified: true },
        select: { id: true },
      });
      const partner = await db.partnerProfile.create({
        data: { userId: pUser.id, partnerCode: "PSZZRECR", status: "APPROVED", approvedAt: new Date() },
        select: { id: true },
      });
      const owner = await db.user.create({
        data: {
          name: TAG + " Owner", email: "zztmp-recur-o@pgsathi.test", phone: OWNER_PHONE,
          passwordHash: hash, role: "OWNER", isVerified: true, phoneVerified: true,
          partnerId: partner.id, // attributed to the partner
        },
        select: { id: true },
      });
      const plan = await db.plan.create({
        data: {
          name: TAG + " Plan", slug: PLAN_SLUG,
          price: 1000, quarterlyPrice: 2700, halfYearlyPrice: 5000, yearlyPrice: 9000,
          maxListings: 5, maxPhotos: 10, maxTenants: 50, features: [],
          partnerCommissionType: "PERCENT", partnerCommissionValue: 10,
        },
        select: { id: true },
      });
      return { partnerId: partner.id, ownerId: owner.id, planId: plan.id };
    });

    const browser = await chromium.launch();
    const page = await (await browser.newContext()).newPage();

    // ── log in as the owner ────────────────────────────────────────────────
    let session = null;
    for (let attempt = 1; attempt <= 3 && !session?.user; attempt++) {
      await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 240000 }).catch(() => {});
      await page.waitForSelector('input[type="tel"], input[name="phone"]', { timeout: 90000 }).catch(() => {});
      await page.waitForTimeout(1200);
      await page.fill('input[type="tel"], input[name="phone"]', OWNER_PHONE).catch(() => {});
      await page.fill('input[type="password"]', OWNER_PASS).catch(() => {});
      await page.click('button[type="submit"]').catch(() => {});
      for (let i = 0; i < 40 && !session?.user; i++) {
        await page.waitForTimeout(2000);
        session = await page.evaluate(() => fetch("/api/auth/session").then((r) => r.json()).catch(() => null)).catch(() => null);
      }
    }
    check("owner login", !!session?.user, session?.user?.role ?? "no session");
    if (!session?.user) { await browser.close(); return; }

    const buy = (cycle, n) => {
      const orderId = `zztmp_order_${cycle}_${n}`;
      const payId = `zztmp_pay_${cycle}_${n}`;
      return page.evaluate(async ([slug, cycle, orderId, payId, sig]) => {
        const r = await fetch("/api/subscription", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: slug, billingCycle: cycle, razorpayOrderId: orderId, razorpayPaymentId: payId, razorpaySignature: sig }),
        });
        return { status: r.status, body: await r.json().catch(() => ({})) };
      }, [PLAN_SLUG, cycle, orderId, payId, sign(orderId, payId)]);
    };

    console.log("\n=== payment 1 — monthly ₹1000, commission 10% ===");
    let r = await buy("MONTHLY", 1);
    check("first payment accepted", r.status === 200 && r.body.success, `${r.status} ${r.body.message ?? ""}`);

    let state = await withDb(async (db) => ({
      earnings: await db.partnerEarning.findMany({
        where: { partnerId: fixture.partnerId }, orderBy: { id: "asc" },
        select: { id: true, amount: true, ownerId: true, invoiceId: true, listingId: true, planPriceSnapshot: true, status: true },
      }),
      invoices: await db.invoice.findMany({
        where: { subscription: { userId: fixture.ownerId } }, orderBy: { id: "asc" },
        select: { id: true, amount: true, billingCycle: true, status: true, periodStart: true, periodEnd: true },
      }),
    }));
    check("invoice was written", state.invoices.length === 1, `${state.invoices.length} invoice(s)`);
    check("invoice amount = monthly price", state.invoices[0]?.amount === 1000, `₹${state.invoices[0]?.amount}`);
    check("commission created", state.earnings.length === 1, `${state.earnings.length} earning(s)`);
    check("commission = 10% of ₹1000", state.earnings[0]?.amount === 100, `₹${state.earnings[0]?.amount}`);
    check("earning anchored to the owner", state.earnings[0]?.ownerId === fixture.ownerId);
    check("earning anchored to the invoice", state.earnings[0]?.invoiceId === state.invoices[0]?.id);
    check("earning has no PG (owner-level)", state.earnings[0]?.listingId === null, `listingId=${state.earnings[0]?.listingId}`);

    console.log("\n=== payment 2 — renewal (THE decisive test) ===");
    r = await buy("MONTHLY", 2);
    check("renewal accepted", r.status === 200 && r.body.success, `${r.status} ${r.body.message ?? ""}`);
    state = await withDb(async (db) => ({
      earnings: await db.partnerEarning.findMany({ where: { partnerId: fixture.partnerId }, orderBy: { id: "asc" }, select: { id: true, amount: true, invoiceId: true } }),
      invoices: await db.invoice.findMany({ where: { subscription: { userId: fixture.ownerId } }, select: { id: true } }),
    }));
    check("SECOND commission created on renewal", state.earnings.length === 2, `${state.earnings.length} earning(s)`);
    check("both commissions ₹100", state.earnings.every((e) => e.amount === 100), state.earnings.map((e) => e.amount).join(","));
    check("each commission has its own invoice", new Set(state.earnings.map((e) => e.invoiceId)).size === 2);

    console.log("\n=== payment 3 — 6 month cycle bills and earns on the 6-month price ===");
    r = await buy("HALF_YEARLY", 3);
    check("6-month payment accepted", r.status === 200 && r.body.success, `${r.status} ${r.body.message ?? ""}`);
    state = await withDb(async (db) => ({
      earnings: await db.partnerEarning.findMany({ where: { partnerId: fixture.partnerId }, orderBy: { id: "desc" }, take: 1, select: { amount: true, planPriceSnapshot: true } }),
      invoices: await db.invoice.findMany({ where: { subscription: { userId: fixture.ownerId } }, orderBy: { id: "desc" }, take: 1, select: { amount: true, billingCycle: true, periodStart: true, periodEnd: true } }),
    }));
    check("invoice billed the 6-month price", state.invoices[0]?.amount === 5000, `₹${state.invoices[0]?.amount}`);
    check("invoice records the cycle", state.invoices[0]?.billingCycle === "HALF_YEARLY", state.invoices[0]?.billingCycle);
    const months = state.invoices[0]?.periodStart && state.invoices[0]?.periodEnd
      ? Math.round((state.invoices[0].periodEnd - state.invoices[0].periodStart) / (1000 * 60 * 60 * 24 * 30.4))
      : -1;
    check("period spans ~6 months", months === 6, `${months} months`);
    check("commission = 10% of ₹5000", state.earnings[0]?.amount === 500, `₹${state.earnings[0]?.amount}`);

    console.log("\n=== guards ===");
    r = await page.evaluate(async ([slug, sig]) => {
      const res = await fetch("/api/subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: slug, billingCycle: "NONSENSE", razorpayOrderId: "zztmp_o_x", razorpayPaymentId: "zztmp_p_x", razorpaySignature: sig }),
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    }, [PLAN_SLUG, sign("zztmp_o_x", "zztmp_p_x")]);
    check("unknown cycle falls back to monthly, not free", r.status === 200 && r.body.data?.amount === 1000, `₹${r.body.data?.amount}`);

    r = await page.evaluate(async ([slug]) => {
      const res = await fetch("/api/subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: slug, billingCycle: "YEARLY", razorpayOrderId: "x", razorpayPaymentId: "y", razorpaySignature: "forged" }),
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    }, [PLAN_SLUG]);
    check("forged payment signature rejected", r.status === 400, `${r.status} ${r.body.message ?? ""}`);

    const total = await withDb((db) => db.partnerEarning.aggregate({ where: { partnerId: fixture.partnerId }, _sum: { amount: true }, _count: { _all: true } }));
    console.log(`\n  partner earned ₹${total._sum.amount} across ${total._count._all} payments`);

    await browser.close();
  } finally {
    const ok = await cleanup();
    console.log(ok ? "\ncleanup: temp fixture removed" : "\ncleanup FAILED — re-run to retry");
  }

  console.log(`\n${fail === 0 ? "NO ISSUES" : fail + " ISSUE(S)"}  (${pass} passed)`);
  issues.forEach((i) => console.log("   ⚠ " + i));
})();
