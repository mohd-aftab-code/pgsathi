/* Regression test for the partner earning state machine.

   Run with the dev server up:  node scripts/check-partner-earning-state.js

   Verifies:
   - mark_paid records a PartnerPayout and links the earning to it
   - a second mark_paid is rejected (no double payout)
   - PAID earnings can no longer be edited / approved / cancelled
   - mark_paid straight from PENDING is rejected

   Creates its own temp admin/partner/owner/listings/earnings, all tagged, and
   removes them afterwards — including leftovers from a run that died mid-way. */
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const BASE = "http://localhost:3000";
const TAG = "ZZTMP-EARNFIX";
const ADMIN_EMAIL = "zztmp-earnfix-admin@pgsathi.test";
// Generated per run, never committed. This repository is public and the fixture
// is a real ADMIN account on the live database — a hardcoded password here would
// be a working admin login for anyone if the script died before its cleanup.
const ADMIN_PASS = "Tmp" + require("crypto").randomBytes(9).toString("base64").replace(/[+/=]/g, "") + "1!";

/* The dev server's Prisma client holds most of the 5-connection default pool, so a
   plain `new PrismaClient()` here just times out. Ask for a single connection
   instead — this only affects this script, .env is untouched. */
function mkClient() {
  const base = process.env.DATABASE_URL;
  const url = base + (base.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=60";
  return new PrismaClient({ datasources: { db: { url } } });
}

/* Removes anything tagged by this script — its own rows and any left behind by a
   previous run that died mid-way. Runs before and after the test, with retries,
   because Neon's pooled endpoint drops connections occasionally. */
async function cleanup(attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    const c = mkClient();
    try {
      const uids = (await c.user.findMany({
        where: { OR: [{ name: { startsWith: TAG } }, { email: { startsWith: "zztmp-earnfix" } }] },
        select: { id: true },
      })).map(u => u.id);
      const pids = uids.length
        ? (await c.partnerProfile.findMany({ where: { userId: { in: uids } }, select: { id: true } })).map(p => p.id)
        : [];

      if (pids.length) {
        // Break the earning→payout link first, or the payout delete is blocked.
        await c.partnerEarning.updateMany({ where: { partnerId: { in: pids } }, data: { payoutId: null } });
        await c.partnerPayout.deleteMany({ where: { partnerId: { in: pids } } });
        await c.partnerEarning.deleteMany({ where: { partnerId: { in: pids } } });
        await c.partnerActivityLog.deleteMany({ where: { partnerId: { in: pids } } });
        await c.partnerSetting.deleteMany({ where: { partnerId: { in: pids } } });
      }
      await c.listing.deleteMany({ where: { title: { startsWith: TAG } } });
      if (pids.length) await c.partnerProfile.deleteMany({ where: { id: { in: pids } } });
      if (uids.length) {
        await c.notification.deleteMany({ where: { userId: { in: uids } } });
        await c.adminAuditLog.deleteMany({ where: { adminId: { in: uids } } });
        await c.user.deleteMany({ where: { id: { in: uids } } });
      }
      return true;
    } catch (e) {
      if (i === attempts) { console.log("cleanup error:", e.message.split("\n")[0]); return false; }
      await new Promise(r => setTimeout(r, 3000));
    } finally {
      await c.$disconnect().catch(() => {});
    }
  }
  return false;
}

let pass = 0, fail = 0;
const issues = [];
const check = (l, ok, d = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${d ? "  — " + d : ""}`);
  if (ok) pass++; else { fail++; issues.push(l + (d ? " (" + d + ")" : "")); }
};

(async () => {
  await cleanup(); // clear anything a previous run left behind

  const db = mkClient();
  const made = { users: [], listings: [], partner: null, earnings: [] };

  try {
    // ── build an isolated fixture ──────────────────────────────────────────
    const hash = await bcrypt.hash(ADMIN_PASS, 10);
    const admin = await db.user.create({
      data: { name: TAG + " Admin", email: ADMIN_EMAIL, phone: "9000000191", passwordHash: hash, role: "ADMIN", isVerified: true },
      select: { id: true },
    });
    made.users.push(admin.id);

    const pUser = await db.user.create({
      data: { name: TAG + " Partner", email: "zztmp-earnfix-p@pgsathi.test", phone: "9000000192", passwordHash: hash, role: "PARTNER", isVerified: true },
      select: { id: true },
    });
    made.users.push(pUser.id);
    const partner = await db.partnerProfile.create({
      data: { userId: pUser.id, partnerCode: "PSZZTMP1", status: "APPROVED", approvedAt: new Date() },
      select: { id: true },
    });
    made.partner = partner.id;

    const owner = await db.user.create({
      data: { name: TAG + " Owner", email: "zztmp-earnfix-o@pgsathi.test", phone: "9000000193", passwordHash: hash, role: "OWNER", isVerified: true },
      select: { id: true },
    });
    made.users.push(owner.id);

    const mkListing = async (n) => {
      const l = await db.listing.create({
        data: {
          title: `${TAG} PG ${n}`, slug: `zztmp-earnfix-pg-${n}-${admin.id}`,
          ownerId: owner.id, partnerId: partner.id, registeredVia: "PARTNER",
        },
        select: { id: true },
      });
      made.listings.push(l.id);
      return l.id;
    };

    const l1 = await mkListing(1);
    const l2 = await mkListing(2);
    const e1 = await db.partnerEarning.create({ data: { partnerId: partner.id, listingId: l1, amount: 0, status: "PENDING" }, select: { id: true } });
    const e2 = await db.partnerEarning.create({ data: { partnerId: partner.id, listingId: l2, amount: 700, status: "PENDING" }, select: { id: true } });
    made.earnings.push(e1.id, e2.id);
    await db.$disconnect();

    // ── drive the real API as a logged-in admin ────────────────────────────
    const browser = await chromium.launch();
    const page = await (await browser.newContext()).newPage();

    await page.goto(`${BASE}/admin-portal-login`, { waitUntil: "networkidle", timeout: 120000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    // The page hard-navigates to /dashboard/admin on success; evaluating during
    // that navigation throws "execution context destroyed".
    await page.waitForURL(/\/dashboard\/admin/, { timeout: 180000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 180000 }).catch(() => {});
    let session = null;
    for (let i = 0; i < 30 && !session?.user; i++) {
      await page.waitForTimeout(1500);
      session = await page.evaluate(() => fetch("/api/auth/session").then(r => r.json()).catch(() => null)).catch(() => null);
    }
    check("admin login", session?.user?.role === "ADMIN", session?.user?.role ?? "no session");
    if (session?.user?.role !== "ADMIN") { await browser.close(); return; }

    const call = (id, payload) => page.evaluate(async ([id, payload]) => {
      const r = await fetch(`/api/admin/partner-earnings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      return { status: r.status, body: await r.json().catch(() => ({})) };
    }, [id, payload]);

    console.log("\n=== happy path ===");
    let r = await call(e1.id, { action: "mark_paid" });
    check("mark_paid on PENDING is rejected", r.status === 400, `${r.status} ${r.body.message ?? ""}`);

    r = await call(e1.id, { action: "set_amount", amount: 900 });
    check("set_amount on PENDING works", r.status === 200 && r.body.success, `${r.status}`);

    r = await call(e1.id, { action: "approve" });
    check("approve works", r.status === 200 && r.body.success, `${r.status}`);

    r = await call(e1.id, { action: "mark_paid", method: "BANK", reference: "TMPUTR777" });
    check("mark_paid on APPROVED works", r.status === 200 && r.body.success, `${r.status} ${r.body.message ?? ""}`);

    console.log("\n=== the actual fix: a payout row exists and is linked ===");
    const db2 = mkClient();
    const paid = await db2.partnerEarning.findUnique({
      where: { id: e1.id },
      select: { status: true, amount: true, payoutId: true, paidAt: true },
    });
    check("earning is PAID", paid.status === "PAID", paid.status);
    check("earning is linked to a payout", paid.payoutId !== null, `payoutId=${paid.payoutId}`);

    const payout = paid.payoutId
      ? await db2.partnerPayout.findUnique({ where: { id: paid.payoutId }, select: { amount: true, method: true, reference: true, status: true, partnerId: true, createdBy: true } })
      : null;
    check("payout amount matches the earning", payout?.amount === paid.amount, `payout ₹${payout?.amount} vs earning ₹${paid.amount}`);
    check("payout records the method", payout?.method === "BANK", payout?.method ?? "-");
    check("payout records the reference", payout?.reference === "TMPUTR777", payout?.reference ?? "-");
    check("payout belongs to the right partner", payout?.partnerId === partner.id);
    check("payout records which admin sent it", payout?.createdBy === admin.id);

    console.log("\n=== PAID is terminal ===");
    r = await call(e1.id, { action: "mark_paid" });
    check("second mark_paid rejected (no double payout)", r.status === 400, `${r.status} ${r.body.message ?? ""}`);
    r = await call(e1.id, { action: "set_amount", amount: 99999 });
    check("set_amount on PAID rejected", r.status === 400, `${r.status}`);
    r = await call(e1.id, { action: "approve" });
    check("re-approve of PAID rejected", r.status === 400, `${r.status}`);
    r = await call(e1.id, { action: "cancel" });
    check("cancel of PAID rejected", r.status === 400, `${r.status}`);

    const payoutCount = await db2.partnerPayout.count({ where: { partnerId: partner.id } });
    check("exactly one payout was created", payoutCount === 1, `${payoutCount}`);
    const still = await db2.partnerEarning.findUnique({ where: { id: e1.id }, select: { status: true, amount: true } });
    check("PAID earning unchanged after rejected calls", still.status === "PAID" && still.amount === 900, `${still.status} ₹${still.amount}`);

    console.log("\n=== CANCELLED is terminal ===");
    r = await call(e2.id, { action: "cancel" });
    check("cancel on PENDING works", r.status === 200 && r.body.success, `${r.status}`);
    r = await call(e2.id, { action: "approve" });
    check("approve of CANCELLED rejected", r.status === 400, `${r.status}`);
    r = await call(e2.id, { action: "mark_paid" });
    check("mark_paid of CANCELLED rejected", r.status === 400, `${r.status}`);

    console.log("\n=== global invariant ===");
    const unlinked = await db2.partnerEarning.count({ where: { status: "PAID", payoutId: null, partnerId: partner.id } });
    check("no PAID earning without a payout (this fixture)", unlinked === 0, `${unlinked}`);

    await db2.$disconnect();
    await browser.close();
  } finally {
    const ok = await cleanup();
    console.log(ok ? "\ncleanup: temp fixture removed" : "\ncleanup FAILED — re-run the script to retry");
  }

  console.log(`\n${fail === 0 ? "NO ISSUES" : fail + " ISSUE(S)"}  (${pass} passed)`);
  issues.forEach(i => console.log("   ⚠ " + i));
})();
