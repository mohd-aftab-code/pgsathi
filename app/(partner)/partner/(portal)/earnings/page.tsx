import Link from "next/link";
import { IndianRupee, Clock, CheckCircle2, Wallet, TrendingUp, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { getEarningSummary, getEarningList } from "@/lib/partner-earnings";
import { cycleLabel } from "@/lib/billing";
import { StatCard } from "@/components/partner/StatCard";

export const metadata = { title: "Earnings — Partner | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const statusStyle: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  APPROVED: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  CANCELLED: "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
};

export default async function PartnerEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const ctx = await requirePartner();
  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const [summary, list] = await Promise.all([
    getEarningSummary(ctx.partnerId),
    getEarningList(ctx.partnerId, { status: status || undefined, page }),
  ]);

  const cards = [
    { label: "Pending", value: inr(summary.pending), sub: `${summary.count.pending} earnings`, Icon: Clock, tone: "amber" as const },
    { label: "Approved", value: inr(summary.approved), sub: `${summary.count.approved} ready`, Icon: CheckCircle2, tone: "blue" as const },
    { label: "Paid", value: inr(summary.paid), sub: `${summary.count.paid} received`, Icon: Wallet, tone: "green" as const },
    { label: "Net Earnings", value: inr(summary.net), sub: "lifetime", Icon: IndianRupee, accent: true },
    { label: "This Month", value: inr(summary.thisMonth), sub: `pichla: ${inr(summary.lastMonth)}`, Icon: Calendar, tone: "violet" as const },
    { label: "Lifetime", value: inr(summary.lifetime), sub: "excluding cancelled", Icon: TrendingUp, tone: "green" as const },
  ];

  const tab = (label: string, val: string) => (
    <Link
      href={val ? `/partner/earnings?status=${val}` : "/partner/earnings"}
      className={`h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center transition-colors ${
        status === val
          ? "bg-primary-500 text-white"
          : "border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      {label}
    </Link>
  );

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/partner/earnings?${qs}` : "/partner/earnings";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Earnings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Har paid PG par admin dwara set ki gayi earning. Koi commission % nahi.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="flex flex-wrap gap-2">
        {tab("All", "")}
        {tab("Pending", "PENDING")}
        {tab("Approved", "APPROVED")}
        {tab("Paid", "PAID")}
        {tab("Cancelled", "CANCELLED")}
      </div>

      {list.rows.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center mx-auto mb-3">
            <IndianRupee className="text-neutral-400" size={22} />
          </div>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">Abhi koi earning nahi</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Jab aapka register kiya PG paid plan par jayega, tab earning banegi.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="px-5 py-3 font-bold">Owner</th>
                  <th className="px-3 py-3 font-bold hidden sm:table-cell">Plan</th>
                  <th className="px-3 py-3 font-bold hidden sm:table-cell">Date</th>
                  <th className="px-3 py-3 font-bold text-right">Amount</th>
                  <th className="px-5 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {list.rows.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Commission is owner-level, so the owner names the row. Older
                        per-PG earnings have no owner — fall back to the PG. */}
                    <td className="px-5 py-3">
                      {e.owner ? (
                        <>
                          <span className="font-semibold text-neutral-900 dark:text-white block truncate max-w-[220px]">{e.owner.name}</span>
                          <span className="text-xs text-neutral-400">
                            {e.invoice?.periodStart && e.invoice?.periodEnd
                              ? `${fmtDate(e.invoice.periodStart)} – ${fmtDate(e.invoice.periodEnd)}`
                              : e.listing?.city?.name ?? "—"}
                          </span>
                        </>
                      ) : e.listing ? (
                        <>
                          <Link href={`/partner/pgs/${e.listing.id}`} className="font-semibold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate max-w-[220px]">
                            {e.listing.title}
                          </Link>
                          <span className="text-xs text-neutral-400">{e.listing.city?.name ?? "—"}</span>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-neutral-600 dark:text-neutral-300 hidden sm:table-cell">
                      {e.planNameSnapshot ?? "—"}
                      {e.invoice && <span className="text-xs text-neutral-400 block">{cycleLabel(e.invoice.billingCycle)} · {inr(e.planPriceSnapshot ?? 0)}</span>}
                    </td>
                    <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">{fmtDate(e.createdAt)}</td>
                    <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-white">{inr(e.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusStyle[e.status] ?? statusStyle.PENDING}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {list.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Page {list.page} of {list.totalPages}</span>
              <div className="flex gap-2">
                <Link href={buildHref(page - 1)} aria-disabled={page <= 1} className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}>
                  <ChevronLeft size={15} /> Prev
                </Link>
                <Link href={buildHref(page + 1)} aria-disabled={page >= list.totalPages} className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold ${page >= list.totalPages ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}>
                  Next <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
