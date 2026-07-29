/**
 * lib/partner-reports.ts (server-only)
 * The five partner report datasets. Each returns { columns, rows } so the same
 * shape can be previewed on screen and exported to CSV.
 *
 * All datasets are scoped by partnerId. Export format note: CSV opens directly
 * in Excel, and the report page offers browser "Save as PDF" — so no heavy
 * xlsx/pdf dependency is pulled in.
 */
import "server-only";
import { db } from "@/lib/db";

export type ReportType = "pg" | "revenue" | "renewal" | "earnings" | "monthly";

export type ReportData = { title: string; columns: string[]; rows: (string | number)[][] };

const fmtDate = (d: Date | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const PAID_SUB = () => ({
  status: { in: ["ACTIVE", "TRIAL"] as any },
  endDate: { gt: new Date() },
  plan: { price: { gt: 0 } },
});

export const REPORTS: { type: ReportType; label: string; desc: string }[] = [
  { type: "pg", label: "PG Report", desc: "All registered PGs, with status and plan" },
  { type: "revenue", label: "Revenue Report", desc: "Platform revenue from your owners" },
  { type: "renewal", label: "Renewal Report", desc: "PGs renewing in the next 30 days" },
  { type: "earnings", label: "Earnings Report", desc: "Amount and status of each earning" },
  { type: "monthly", label: "Monthly Report", desc: "Month-wise registrations and earnings" },
];

export async function buildReport(partnerId: number, type: ReportType): Promise<ReportData> {
  switch (type) {
    case "pg": {
      const listings = await db.listing.findMany({
        where: { partnerId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, status: true, priceMin: true, createdAt: true, ownerId: true,
          city: { select: { name: true } }, owner: { select: { name: true, phone: true } },
        },
      });
      const paid = new Set(
        (await db.subscription.findMany({ where: { userId: { in: listings.map((l) => l.ownerId) }, ...PAID_SUB() }, select: { userId: true } })).map((s) => s.userId)
      );
      return {
        title: "PG Report",
        columns: ["PG", "City", "Owner", "Phone", "Rent", "Plan", "Status", "Registered"],
        rows: listings.map((l) => [
          l.title, l.city?.name ?? "—", l.owner?.name ?? "—", l.owner?.phone ?? "—",
          l.priceMin, paid.has(l.ownerId) ? "PAID" : "FREE", l.status, fmtDate(l.createdAt),
        ]),
      };
    }

    case "revenue": {
      const listings = await db.listing.findMany({ where: { partnerId }, select: { ownerId: true, owner: { select: { name: true } } } });
      const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
      const nameByOwner = new Map(listings.map((l) => [l.ownerId, l.owner?.name ?? "—"]));
      const subs = ownerIds.length
        ? await db.subscription.findMany({ where: { userId: { in: ownerIds }, ...PAID_SUB() }, include: { plan: { select: { name: true, price: true } } }, orderBy: { endDate: "desc" } })
        : [];
      const seen = new Set<number>();
      const rows: (string | number)[][] = [];
      for (const s of subs) {
        if (seen.has(s.userId)) continue;
        seen.add(s.userId);
        rows.push([nameByOwner.get(s.userId) ?? "—", s.plan.name, s.amount, fmtDate(s.endDate)]);
      }
      return { title: "Revenue Report", columns: ["Owner", "Plan", "Amount (₹)", "Renews"], rows };
    }

    case "renewal": {
      const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const listings = await db.listing.findMany({ where: { partnerId }, select: { title: true, ownerId: true, owner: { select: { name: true, phone: true } } } });
      const subs = await db.subscription.findMany({
        where: { userId: { in: listings.map((l) => l.ownerId) }, ...PAID_SUB(), endDate: { lte: in30, gt: new Date() } },
        include: { plan: { select: { name: true } } }, orderBy: { endDate: "asc" },
      });
      const subByOwner = new Map(subs.map((s) => [s.userId, s]));
      const rows = listings
        .filter((l) => subByOwner.has(l.ownerId))
        .map((l) => {
          const s = subByOwner.get(l.ownerId)!;
          return [l.title, l.owner?.name ?? "—", l.owner?.phone ?? "—", s.plan.name, fmtDate(s.endDate)];
        });
      return { title: "Renewal Report", columns: ["PG", "Owner", "Phone", "Plan", "Renews On"], rows };
    }

    case "earnings": {
      const earnings = await db.partnerEarning.findMany({
        where: { partnerId }, orderBy: { createdAt: "desc" },
        select: {
          amount: true, status: true, createdAt: true, paidAt: true,
          planNameSnapshot: true, planPriceSnapshot: true,
          owner: { select: { name: true } },
          listing: { select: { title: true } },
        },
      });
      return {
        title: "Earnings Report",
        // Commission is owner-level; the PG column stays for older per-PG rows.
        columns: ["Owner", "Plan", "Paid By Owner (₹)", "Commission (₹)", "Status", "Created", "Paid On"],
        rows: earnings.map((e) => [
          e.owner?.name ?? e.listing?.title ?? "—",
          e.planNameSnapshot ?? "—",
          e.planPriceSnapshot ?? 0,
          e.amount,
          e.status,
          fmtDate(e.createdAt),
          fmtDate(e.paidAt),
        ]),
      };
    }

    case "monthly": {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const [listings, earnings] = await Promise.all([
        db.listing.findMany({ where: { partnerId, createdAt: { gte: from } }, select: { createdAt: true } }),
        db.partnerEarning.findMany({ where: { partnerId, status: { not: "CANCELLED" }, createdAt: { gte: from } }, select: { createdAt: true, amount: true } }),
      ]);
      const months: { key: string; label: string; regs: number; earn: number }[] = [];
      const idx = new Map<string, number>();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        idx.set(`${d.getFullYear()}-${d.getMonth()}`, months.length);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }), regs: 0, earn: 0 });
      }
      listings.forEach((l) => { const i = idx.get(`${l.createdAt.getFullYear()}-${l.createdAt.getMonth()}`); if (i !== undefined) months[i].regs++; });
      earnings.forEach((e) => { const i = idx.get(`${e.createdAt.getFullYear()}-${e.createdAt.getMonth()}`); if (i !== undefined) months[i].earn += e.amount; });
      return { title: "Monthly Report", columns: ["Month", "Registrations", "Earnings (₹)"], rows: months.map((m) => [m.label, m.regs, m.earn]) };
    }
  }
}

/** RFC-4180-ish CSV: quote fields containing comma/quote/newline, escape quotes. */
export function toCsv(data: ReportData): string {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [data.columns.map(esc).join(","), ...data.rows.map((r) => r.map(esc).join(","))].join("\n");
}
