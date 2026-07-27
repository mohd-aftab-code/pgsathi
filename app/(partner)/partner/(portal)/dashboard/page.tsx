import Link from "next/link";
import {
  Building2, CheckCircle2, CircleDashed, BadgeCheck, TrendingUp, Clock,
  IndianRupee, CalendarClock, CalendarPlus, ArrowRight, Activity, Plus,
} from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { getPartnerStats, getPartnerTrend, getPartnerRecentPgs, getPartnerActivity } from "@/lib/partner-stats";
import { StatCard } from "@/components/partner/StatCard";
import { RegistrationsChart, EarningsChart } from "@/components/partner/PartnerCharts";

export const metadata = { title: "Partner Dashboard — PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function timeAgo(d: Date) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "abhi";
  if (mins < 60) return `${mins}m pehle`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h pehle`;
  const days = Math.floor(h / 24);
  return days === 1 ? "kal" : `${days} din pehle`;
}

export default async function PartnerDashboardPage() {
  const ctx = await requirePartner();

  // Everything below is scoped to ctx.partnerId, which comes from the session.
  const [stats, trend, recentPgs, activity] = await Promise.all([
    getPartnerStats(ctx.partnerId),
    getPartnerTrend(ctx.partnerId),
    getPartnerRecentPgs(ctx.partnerId),
    getPartnerActivity(ctx.partnerId),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "Total PG Registered", value: String(stats.totalPgs), sub: `${stats.thisMonthRegistrations} is mahine`, Icon: Building2, tone: "violet" as const, href: "/partner/pgs" },
    { label: "Active PGs", value: String(stats.activePgs), sub: "live and verified", Icon: CheckCircle2, tone: "green" as const, href: "/partner/pgs?status=ACTIVE" },
    { label: "Free Plan PGs", value: String(stats.freePlanPgs), sub: "abhi convert nahi hue", Icon: CircleDashed, tone: "slate" as const, href: "/partner/pgs" },
    { label: "Paid Plan PGs", value: String(stats.paidPlanPgs), sub: `${stats.conversionRate}% conversion`, Icon: BadgeCheck, tone: "blue" as const, href: "/partner/pgs" },
    { label: "Revenue Generated", value: inr(stats.revenueGenerated), sub: "for the platform", Icon: TrendingUp, tone: "green" as const, href: "/partner/reports?type=revenue" },
    { label: "Pending Earnings", value: inr(stats.pendingEarnings), sub: "payout ka intezaar", Icon: Clock, tone: "amber" as const, href: "/partner/earnings?status=PENDING" },
    { label: "Net Earnings", value: inr(stats.netEarnings), sub: `${inr(stats.paidEarnings)} mil chuke`, Icon: IndianRupee, accent: true, href: "/partner/earnings" },
    { label: "Renewal Due", value: String(stats.renewalDue), sub: "agle 30 din mein", Icon: CalendarClock, tone: "red" as const, href: "/partner/reports?type=renewal" },
    { label: "This Month", value: String(stats.thisMonthRegistrations), sub: "naye registrations", Icon: CalendarPlus, tone: "violet" as const, href: "/partner/pgs" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {greeting}, {ctx.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Complete summary of your registered PGs and earnings.
          </p>
        </div>
        <Link
          href="/partner/pgs/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
        >
          <Plus size={17} /> PG Register
        </Link>
      </div>

      {/* ── 9 analytics cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">PG Registrations</h2>
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              6 mahine
            </span>
          </div>
          <RegistrationsChart data={trend} />
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">Earnings Trend</h2>
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              6 mahine
            </span>
          </div>
          <EarningsChart data={trend} />
        </section>
      </div>

      {/* ── Performance summary ───────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Conversion</span>
              <span className="font-bold text-neutral-900 dark:text-white">{stats.conversionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                style={{ width: `${Math.min(100, stats.conversionRate)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
              {stats.paidPlanPgs} of {stats.totalPgs} PGs paid
            </p>
          </div>

          {[
            { label: "Paid out", value: inr(stats.paidEarnings) },
            { label: "Avg / paid PG", value: inr(stats.avgEarningPerPaidPg) },
            { label: "Renewals due", value: String(stats.renewalDue) },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">{m.label}</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white">{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent PGs + Activity ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">Recent PGs</h2>
            {/* -my-2 keeps the header height unchanged while giving the link a
                thumb-sized hit box. */}
            <Link
              href="/partner/pgs"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 py-2 -my-2 px-1 -mx-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentPgs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center mx-auto mb-3">
                <Building2 className="text-neutral-400" size={22} />
              </div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Abhi koi PG register nahi kiya</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                Pehla PG add karein — paid hone par earning ban jayegi.
              </p>
              <Link href="/partner/pgs/new" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">
                <Plus size={15} /> PG Register
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentPgs.map((pg) => (
                <div key={pg.id} className="px-4 sm:px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  {/* Mobile: stacked layout */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-neutral-900 dark:text-white text-sm truncate">{pg.title}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {pg.city ?? "—"} · {timeAgo(pg.createdAt)}
                      </div>
                    </div>
                    {/* Badges: stack vertically on very small, side by side on sm+ */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          pg.plan === "PAID"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {pg.plan}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          pg.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        }`}
                      >
                        {pg.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <Activity size={15} className="text-primary-500" /> Recent Activity
            </h2>
          </div>
          <div className="p-5">
            {activity.length === 0 ? (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-8">
                Abhi koi activity nahi
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-snug">{a.action}</p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
