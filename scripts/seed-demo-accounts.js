/* Creates one ADMIN, one OWNER and one PARTNER demo account so the three
   portals can be clicked through end to end, plus enough partner-programme data
   for the new screens to show something real (earnings in every state, referral
   clicks for the funnel, leads for the pipeline).

     node scripts/seed-demo-accounts.js            # create + print credentials
     node scripts/seed-demo-accounts.js --cleanup  # remove everything it made

   RUN THE MIGRATION FIRST:
     npm run db:apply 20260730120000_partner_program_hardening
   Without it this script fails on columns that do not exist yet.

   Passwords are generated per run and printed once — never hardcoded. These are
   real accounts on the live database, and a fixed password in a committed file
   would be a working login for anyone who reads the repo. The ADMIN one
   especially: delete it with --cleanup as soon as you are done testing.

   Everything is tagged with TAG below, so --cleanup is exact and a run that
   dies half way is fixed by simply running --cleanup and trying again. */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const TAG = "ZZDEMO";
const DOMAIN = "pgsathi.test";

const ACCOUNTS = {
  admin: { email: `zzdemo-admin@${DOMAIN}`, phone: "9000000101", name: "Demo Admin", role: "ADMIN" },
  owner: { email: `zzdemo-owner@${DOMAIN}`, phone: "9000000102", name: "Demo Owner", role: "OWNER" },
  partner: { email: `zzdemo-partner@${DOMAIN}`, phone: "9000000103", name: "Demo Partner", role: "PARTNER" },
};

const newPassword = () =>
  "Demo" + crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "") + "1!";

/* The dev server's Prisma client holds most of the 5-connection default pool, so
   a plain `new PrismaClient()` here just times out. Ask for a single connection
   instead — this only affects this script, .env is untouched. */
function mkClient() {
  const base = process.env.DATABASE_URL;
  const url = base + (base.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=60";
  return new PrismaClient({ datasources: { db: { url } } });
}

/* Neon's pooled endpoint drops connections intermittently, mid-script. */
async function withDb(fn) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const db = mkClient();
    try {
      return await fn(db);
    } catch (e) {
      const transient = /Can't reach database server|connection pool|ECONNRESET/i.test(e.message || "");
      if (transient && attempt < 4) {
        console.log(`  … connection dropped, retrying (${attempt}/3)`);
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }
      throw e;
    } finally {
      await db.$disconnect().catch(() => {});
    }
  }
}

async function cleanup() {
  console.log(`Removing everything tagged ${TAG}…\n`);

  await withDb(async (db) => {
    const users = await db.user.findMany({
      where: { email: { endsWith: `@${DOMAIN}` } },
      select: { id: true, email: true, partnerProfile: { select: { id: true } } },
    });
    if (users.length === 0) {
      console.log("  nothing to remove");
      return;
    }

    const userIds = users.map((u) => u.id);
    const partnerIds = users.filter((u) => u.partnerProfile).map((u) => u.partnerProfile.id);

    // Order matters: earnings reference payouts, payouts reference partners.
    if (partnerIds.length) {
      await db.partnerEarning.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await db.partnerPayout.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await db.partnerLead.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await db.referralClick.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await db.partnerActivityLog.deleteMany({ where: { partnerId: { in: partnerIds } } });
    }
    await db.partnerEarning.deleteMany({ where: { ownerId: { in: userIds } } });
    await db.invoice.deleteMany({ where: { subscription: { userId: { in: userIds } } } });
    await db.subscription.deleteMany({ where: { userId: { in: userIds } } });
    await db.notification.deleteMany({ where: { userId: { in: userIds } } });
    // Detach rather than delete: a real owner may have been attributed to the
    // demo partner while testing, and they must survive the cleanup.
    await db.user.updateMany({
      where: { partnerId: { in: partnerIds } },
      data: { partnerId: null, partnerAttributedAt: null },
    });
    await db.user.deleteMany({ where: { id: { in: userIds } } });

    console.log(`  removed ${users.length} demo account(s) and their data`);
  });
}

async function seed() {
  const passwords = {
    admin: newPassword(),
    owner: newPassword(),
    partner: newPassword(),
  };

  await withDb(async (db) => {
    // Fresh start, so re-running gives a clean predictable state.
    const existing = await db.user.count({ where: { email: { endsWith: `@${DOMAIN}` } } });
    if (existing > 0) {
      console.log("Demo accounts already exist — run with --cleanup first.\n");
      process.exit(1);
    }

    console.log("Creating demo accounts…\n");

    const hash = async (p) => bcrypt.hash(p, 10);

    // ── ADMIN ────────────────────────────────────────────────────────────
    const admin = await db.user.create({
      data: {
        name: ACCOUNTS.admin.name,
        email: ACCOUNTS.admin.email,
        phone: ACCOUNTS.admin.phone,
        passwordHash: await hash(passwords.admin),
        role: "ADMIN",
        isVerified: true,
        isActive: true,
      },
      select: { id: true },
    });

    // ── PARTNER ──────────────────────────────────────────────────────────
    // Approved, with payout details filled AND admin-verified, so the payout
    // pipeline is immediately exercisable. Leave kycVerifiedAt out if you want
    // to see the KYC gate refuse a payout instead.
    const partnerUser = await db.user.create({
      data: {
        name: ACCOUNTS.partner.name,
        email: ACCOUNTS.partner.email,
        phone: ACCOUNTS.partner.phone,
        passwordHash: await hash(passwords.partner),
        role: "PARTNER",
        isVerified: true,
        isActive: true,
      },
      select: { id: true },
    });

    const partnerCode = "PS" + TAG.slice(0, 2) + crypto.randomBytes(2).toString("hex").toUpperCase();
    const partner = await db.partnerProfile.create({
      data: {
        userId: partnerUser.id,
        partnerCode,
        type: "FREELANCER",
        status: "APPROVED",
        city: "Jaipur",
        approvedAt: new Date(),
        approvedBy: admin.id,
        panNumber: "ABCDE1234F",
        upiId: "demo@upi",
        bankName: "HDFC Bank",
        bankAccountNo: "50100123456789",
        bankIfsc: "HDFC0001234",
        kycVerifiedAt: new Date(),
        kycVerifiedBy: admin.id,
      },
      select: { id: true },
    });
    await db.partnerSetting.create({ data: { partnerId: partner.id } });

    // ── OWNER, attributed to that partner ────────────────────────────────
    const owner = await db.user.create({
      data: {
        name: ACCOUNTS.owner.name,
        email: ACCOUNTS.owner.email,
        phone: ACCOUNTS.owner.phone,
        passwordHash: await hash(passwords.owner),
        role: "OWNER",
        isVerified: true,
        isActive: true,
        partnerId: partner.id,
        partnerAttributedAt: new Date(),
      },
      select: { id: true },
    });

    // ── A paid subscription, so there is real money behind the commission ─
    const plan = await db.plan.findFirst({
      where: { isActive: true, price: { gt: 0 } },
      orderBy: { price: "asc" },
      select: { id: true, name: true, price: true },
    });

    let earningsMade = 0;
    if (plan) {
      const start = new Date();
      const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

      const sub = await db.subscription.create({
        data: {
          userId: owner.id,
          planId: plan.id,
          status: "ACTIVE",
          billingCycle: "MONTHLY",
          amount: plan.price,
          startDate: start,
          endDate: end,
        },
        select: { id: true },
      });

      const invoice = await db.invoice.create({
        data: {
          subscriptionId: sub.id,
          amount: plan.price,
          status: "PAID",
          invoiceDate: start,
          paidAt: start,
          billingCycle: "MONTHLY",
          periodStart: start,
          periodEnd: end,
        },
        select: { id: true },
      });

      const commission = Math.max(200, Math.round(plan.price * 0.2));
      const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

      // One earning in each state, so every filter tab and badge has content.
      await db.partnerEarning.createMany({
        data: [
          {
            partnerId: partner.id, ownerId: owner.id, invoiceId: invoice.id, subscriptionId: sub.id,
            amount: commission, status: "PENDING", kind: "REFERRAL",
            planNameSnapshot: plan.name, planPriceSnapshot: plan.price,
            commissionRateSnapshot: `20% of ₹${plan.price}`,
            onHold: false, eligibleAt: daysAgo(1), createdAt: daysAgo(8),
          },
          {
            partnerId: partner.id, ownerId: owner.id, amount: commission, status: "PENDING",
            kind: "REFERRAL", planNameSnapshot: plan.name, planPriceSnapshot: plan.price,
            commissionRateSnapshot: `20% of ₹${plan.price}`,
            onHold: true, holdReason: "Refund window abhi khula hai",
            eligibleAt: new Date(Date.now() + 5 * 86400000), createdAt: daysAgo(2),
          },
          {
            partnerId: partner.id, ownerId: owner.id, amount: commission, status: "APPROVED",
            kind: "REFERRAL", planNameSnapshot: plan.name, planPriceSnapshot: plan.price,
            commissionRateSnapshot: `20% of ₹${plan.price}`,
            approvedAt: daysAgo(3), approvedBy: admin.id, autoApproved: true,
            eligibleAt: daysAgo(10), createdAt: daysAgo(20),
          },
        ],
      });
      earningsMade = 3;
    }

    // ── Referral clicks, so the funnel is not all zeroes ─────────────────
    const clicks = [];
    for (let i = 0; i < 14; i++) {
      clicks.push({
        code: partnerCode,
        partnerId: partner.id,
        landingPath: "/register",
        utmSource: i % 3 === 0 ? "whatsapp" : "poster",
        createdAt: new Date(Date.now() - i * 86400000),
        ...(i < 3 ? { convertedUserId: owner.id, convertedAt: new Date() } : {}),
      });
    }
    await db.referralClick.createMany({ data: clicks });

    // ── Leads, so the pipeline has rows in different stages ──────────────
    await db.partnerLead.createMany({
      data: [
        { partnerId: partner.id, name: "Rahul Sharma", phone: "9812345671", city: "Jaipur", pgName: "Sunrise PG", stage: "CONTACTED", nextFollowUpAt: new Date(Date.now() - 86400000), notes: "Interested, price puchi thi", updatedAt: new Date() },
        { partnerId: partner.id, name: "Anita Verma", phone: "9812345672", city: "Jaipur", pgName: "Green Stay", stage: "DEMO", nextFollowUpAt: new Date(Date.now() + 2 * 86400000), updatedAt: new Date() },
        { partnerId: partner.id, name: "Imran Khan", phone: "9812345673", city: "Delhi", pgName: "City Hostel", stage: "NEGOTIATION", updatedAt: new Date() },
        { partnerId: partner.id, name: "Suresh Gupta", phone: "9812345674", city: "Delhi", stage: "LOST", lostReason: "Apni website bana rahe hain", updatedAt: new Date() },
      ],
    });

    console.log(`  admin    #${admin.id}`);
    console.log(`  partner  #${partner.id}  code ${partnerCode}  (APPROVED, KYC verified)`);
    console.log(`  owner    #${owner.id}   (attributed to the partner)`);
    console.log(`  ${earningsMade} earnings, 14 referral clicks, 4 leads`);
    if (!plan) console.log("  ! no active paid plan found — earnings skipped");
    console.log("");
  });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const line = "─".repeat(64);
  console.log(line);
  console.log("  DEMO LOGINS — printed once, not stored anywhere");
  console.log(line);
  // Which field each login page actually authenticates on — /admin-portal-login
  // takes an email, the other two take a phone number (see lib/auth.ts).
  const LOGIN_PAGES = {
    admin: [
      { url: "/admin-portal-login", field: "email" },
      { url: "/login", field: "phone" },
    ],
    owner: [{ url: "/login", field: "phone" }],
    partner: [{ url: "/partner/login", field: "phone" }],
  };

  for (const [key, acc] of Object.entries(ACCOUNTS)) {
    console.log(`\n  ${acc.role}`);
    console.log(`    phone     ${acc.phone}`);
    console.log(`    email     ${acc.email}`);
    console.log(`    password  ${passwords[key]}`);
    for (const page of LOGIN_PAGES[key]) {
      console.log(`    login     ${base}${page.url}  → sign in with ${page.field.toUpperCase()}`);
    }
  }
  console.log(`\n${line}`);
  console.log("  Each login page accepts only the field marked above:");
  console.log("  /admin-portal-login = email, /login and /partner/login = phone.");
  console.log("  Done testing? Remove them:");
  console.log("    node scripts/seed-demo-accounts.js --cleanup");
  console.log(line);
}

(async () => {
  try {
    if (process.argv.includes("--cleanup")) await cleanup();
    else await seed();
  } catch (e) {
    console.error("\nFAILED:", e.message);
    if (/column .* does not exist|Unknown arg/i.test(e.message || "")) {
      console.error("\nLooks like the migration has not been applied yet:");
      console.error("  npm run db:apply 20260730120000_partner_program_hardening");
    }
    process.exitCode = 1;
  }
})();
