import Link from "next/link";
import { IndianRupee, Clock, CheckCircle2, Wallet, TrendingUp, Calendar, ChevronLeft, ChevronRight, PauseCircle, Receipt, Info } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { getEarningSummary, getEarningList } from "@/lib/partner-earnings";
import { getProgramSettings, nextPayoutDate } from "@/lib/partner-settings";
import { kycGaps } from "@/lib/partner-payouts";
import { db } from "@/lib/db";
import { cycleLabel } from "@/lib/billing";
import { StatCard } from "@/components/partner/StatCard";

export const metadata = { title: "Earnings — Partner | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const statusStyle: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  APPROVED: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  ON_HOLD: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
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

  const [summary, list, settings, profile] = await Promise.all([
    getEarningSummary(ctx.partnerId),
    getEarningList(ctx.partnerId, { status: status || undefined, page }),
    getProgramSettings(),
    db.partnerProfile.findUnique({
      where: { id: ctx.partnerId },
      select: {
        panNumber: true, upiId: true, bankName: true, bankAccountNo: true,
        bankIfsc: true, kycVerifiedAt: true,
      },
    }),
  ]);

  // "Kab aayega" is the single most common partner question; answer it before
  // they have to ask.
  const nextPayout = nextPayoutDate(settings.payoutDayOfMonth);
  const gaps = profile ? kycGaps(profile) : [];
  const belowMinimum = summary.approved > 0 && summary.approved < settings.minPayoutAmount;

  const cards = [
    { label: "Pending", value: inr(summary.pending), sub: `${summary.count.pending} earnings`, Icon: Clock, tone: "amber" as const },
    { label: "On Hold", value: inr(summary.onHold), sub: `${summary.count.onHold} review par`, Icon: PauseCircle, tone: "slate" as const },
    { label: "Approved", value: inr(summary.approved), sub: `${summary.count.approved} ready`, Icon: CheckCircle2, tone: "blue" as const },
    { label: "Paid", value: inr(summary.paid), sub: `${summary.count.paid} received`, Icon: Wallet, tone: "green" as const },
    { label: "Net Earnings", value: inr(summary.net), sub: "lifetime", Icon: IndianRupee, accent: true },
    { label: "This Month", value: inr(summary.thisMonth), sub: `pichla: ${inr(summary.lastMonth)}`, Icon: Calendar, tone: "violet" as const },
  ];

  const tab = (label: string, val: string) => (
    <Link
      href={val ? `/partner/earnings?status=${val}` : "/partner/earnings"}
      className={`h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center transition-colors shrink-0 ${
        status === val
          ? "bg-primary-500 text-white"
          : "border-2 border-neutral-200/60 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
          Har owner ke payment par commission — recurring, jab tak wo renew karte rahein.
        </p>
      </div>

      {/* ── Payout status strip ─────────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="inline-flex items-center gap-2">
            <Calendar size={15} className="text-primary-500" />
            <span className="text-neutral-500 dark:text-neutral-400">Agla payout:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {nextPayout.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">Minimum:</span>
            <span className="font-bold text-neutral-900 dark:text-white">{inr(settings.minPayoutAmount)}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">Refund window:</span>
            <span className="font-bold text-neutral-900 dark:text-white">{settings.holdDays} din</span>
          </div>
        </div>

        {gaps.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm">
            <span className="font-bold text-amber-900 dark:text-amber-400">Payout details adhoore hain</span>
            <span className="text-amber-800 dark:text-amber-500/90"> — abhi baaki: {gaps.join(", ")}. </span>
            <Link href="/partner/profile" className="font-bold text-amber-900 dark:text-amber-400 underline">
              Profile me poora karein
            </Link>
            <span className="text-amber-800 dark:text-amber-500/90"> — tab tak approved earnings hold rahengi.</span>
          </div>
        )}

        {gaps.length === 0 && belowMinimum && (
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1.5">
            <Info size={13} />
            {inr(summary.approved)} approved hai — {inr(settings.minPayoutAmount)} se kam, isliye agle cycle me carry forward hoga.
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
        {tab("All", "")}
        {tab("Pending", "PENDING")}
        {tab("On Hold", "ON_HOLD")}
        {tab("Approved", "APPROVED")}
        {tab("Paid", "PAID")}
        {tab("Cancelled", "CANCELLED")}
      </div>

      {list.rows.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 py-16 text-center">
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
          {/* ── Desktop table ───────────────────────────────────── */}
          <div className="hidden sm:block rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="px-5 py-3 font-bold">Owner / PG</th>
                  <th className="px-3 py-3 font-bold">Plan</th>
                  <th className="px-3 py-3 font-bold">Date</th>
                  <th className="px-3 py-3 font-bold text-right">Amount</th>
                  <th className="px-5 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {list.rows.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-5 py-3">
                      {e.owner ? (
                        <>
                          <span className="font-semibold text-neutral-900 dark:text-white block truncate max-w-[220px]">{e.owner.name}</span>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{e.listing.city?.name ?? "—"}</span>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-neutral-600 dark:text-neutral-300">
                      {e.planNameSnapshot ?? "—"}
                      {e.invoice && <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">{cycleLabel(e.invoice.billingCycle)} · {inr(e.planPriceSnapshot ?? 0)}</span>}
                    </td>
                    <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400">{fmtDate(e.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-bold ${e.amount < 0 ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}`}>
                        {inr(e.amount)}
                      </span>
                      {/* Snapshotted at creation: "yeh amount kaise bana" is the
                          first question in every payout dispute. */}
                      {e.commissionRateSnapshot && (
                        <span className="block text-[11px] text-neutral-400">{e.commissionRateSnapshot}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-xl ${
                        e.onHold && e.status === "PENDING" ? statusStyle.ON_HOLD : statusStyle[e.status] ?? statusStyle.PENDING
                      }`}>
                        {e.onHold && e.status === "PENDING" ? "ON HOLD" : e.status}
                      </span>
                      <span className="block text-[11px] text-neutral-400 mt-1 max-w-[170px] ml-auto">
                        {e.onHold && e.holdReason
                          ? e.holdReason
                          : e.status === "PENDING" && e.eligibleAt && e.eligibleAt > new Date()
                            ? `${fmtDate(e.eligibleAt)} ko approve hogi`
                            : e.status === "PAID" && e.payout?.reference
                              ? `${e.payout.method} · ${e.payout.reference}`
                              : e.status === "PAID" && e.payout?.status === "PROCESSING"
                                ? "transfer process me hai"
                                : e.kind === "OVERRIDE"
                                  ? "team override"
                                  : e.kind === "ADJUSTMENT"
                                    ? "refund clawback"
                                    : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ──────────────────────────────────────── */}
          <div className="sm:hidden space-y-3">
            {list.rows.map((e) => (
              <div key={e.id} className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-4 shadow-sm">
                {/* Row 1: Name + Amount */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    {e.owner ? (
                      <>
                        <div className="font-bold text-neutral-900 dark:text-white truncate">{e.owner.name}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {e.invoice?.periodStart && e.invoice?.periodEnd
                            ? `${fmtDate(e.invoice.periodStart)} – ${fmtDate(e.invoice.periodEnd)}`
                            : e.listing?.city?.name ?? "—"}
                        </div>
                      </>
                    ) : e.listing ? (
                      <>
                        <div className="font-bold text-neutral-900 dark:text-white truncate">{e.listing.title}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{e.listing.city?.name ?? "—"}</div>
                      </>
                    ) : (
                      <div className="font-bold text-neutral-400">—</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-extrabold ${e.amount < 0 ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}`}>
                      {inr(e.amount)}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xl inline-block mt-1 ${
                      e.onHold && e.status === "PENDING" ? statusStyle.ON_HOLD : statusStyle[e.status] ?? statusStyle.PENDING
                    }`}>
                      {e.onHold && e.status === "PENDING" ? "ON HOLD" : e.status}
                    </span>
                  </div>
                </div>
                {/* Row 2: Plan + Date */}
                <div className="flex items-center gap-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate flex-1">
                    {e.planNameSnapshot ?? "—"}
                    {e.invoice && ` · ${cycleLabel(e.invoice.billingCycle)}`}
                  </span>
                  <span className="shrink-0">{fmtDate(e.createdAt)}</span>
                </div>
                {/* Row 3: how the amount was arrived at, and where it is now */}
                {(e.commissionRateSnapshot || e.holdReason || e.payout?.reference) && (
                  <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 space-y-0.5">
                    {e.commissionRateSnapshot && <div>{e.commissionRateSnapshot}</div>}
                    {e.onHold && e.holdReason && (
                      <div className="text-orange-600 dark:text-orange-400 font-semibold">{e.holdReason}</div>
                    )}
                    {e.status === "PAID" && e.payout?.reference && (
                      <div className="inline-flex items-center gap-1">
                        <Receipt size={11} /> {e.payout.method} · {e.payout.reference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {list.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Page {list.page} of {list.totalPages}</span>
              <div className="flex gap-2">
                <Link href={buildHref(page - 1)} aria-disabled={page <= 1} className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200/60 dark:border-neutral-700 text-sm font-semibold ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}>
                  <ChevronLeft size={15} /> Prev
                </Link>
                <Link href={buildHref(page + 1)} aria-disabled={page >= list.totalPages} className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl border-2 border-neutral-200/60 dark:border-neutral-700 text-sm font-semibold ${page >= list.totalPages ? "opacity-40 pointer-events-none" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"} text-neutral-600 dark:text-neutral-300`}>
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
