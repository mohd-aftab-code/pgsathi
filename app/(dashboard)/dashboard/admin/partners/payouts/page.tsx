import Link from "next/link";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Wallet, AlertTriangle, IndianRupee, Users, Clock, ShieldAlert } from "lucide-react";
import { CreatePayoutButton } from "@/components/dashboard/CreatePayoutButton";
import { PayoutRowActions, BulkPayoutButton } from "@/components/dashboard/PayoutActions";
import { QuickKycVerifyButton } from "@/components/dashboard/QuickKycVerifyButton";
import { kycGaps } from "@/lib/partner-payouts";
import { getProgramSettings, nextPayoutDate } from "@/lib/partner-settings";
import { PartnerTabs } from "@/components/dashboard/PartnerTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payout Cycle — Admin | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * The monthly payout run: every partner who is owed money, in one place, with a
 * one-click batch payout each.
 *
 * "Payable" deliberately means APPROVED-and-unpaid only. Pending earnings are
 * shown separately so an admin can see what still needs reviewing, but money
 * never leaves without an approval first.
 */
export default async function AdminPayoutCyclePage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const partnerQuery = {
    where: { earnings: { some: { status: { in: ["PENDING", "APPROVED"] } } } },
    select: {
      id: true,
      partnerCode: true,
      status: true,
      upiId: true,
      bankAccountNo: true,
      panNumber: true,
      panImage: true,
      aadhaarNumber: true,
      aadhaarFrontImage: true,
      aadhaarBackImage: true,
      bankName: true,
      bankIfsc: true,
      kycVerifiedAt: true,
      user: { select: { name: true, phone: true } },
      earnings: {
        where: { status: { in: ["PENDING", "APPROVED"] } },
        select: { id: true, amount: true, status: true, payoutId: true, createdAt: true },
      },
      payouts: { orderBy: { paidAt: "desc" }, take: 1, select: { paidAt: true, amount: true } },
    },
  } satisfies Prisma.PartnerProfileFindManyArgs;

  const partners = await db.partnerProfile.findMany(partnerQuery);

  const rows = partners
    .map((p) => {
      const payable = p.earnings.filter((e) => e.status === "APPROVED" && !e.payoutId);
      const pending = p.earnings.filter((e) => e.status === "PENDING");
      return {
        ...p,
        payouts: p.payouts,
        payableTotal: payable.reduce((t, e) => t + e.amount, 0),
        payableCount: payable.length,
        pendingTotal: pending.reduce((t, e) => t + e.amount, 0),
        pendingCount: pending.length,
        thisMonthCount: p.earnings.filter((e) => e.createdAt >= monthStart).length,
        hasPayoutDetails: !!(p.upiId || p.bankAccountNo),
        // The API refuses a payout while any of these are outstanding, so the
        // table shows the same reason rather than letting the admin find out
        // by clicking.
        gaps: kycGaps(p),
        // true when only gap is admin verification (all docs filled, just needs admin click)
        kycAllFilled: kycGaps(p).filter((g) => g !== "admin verification").length === 0,
        kycVerifiedAt: p.kycVerifiedAt,
      };
    })
    .sort((a, b) => b.payableTotal - a.payableTotal);

  const totalPayable = rows.reduce((t, r) => t + r.payableTotal, 0);
  const totalPending = rows.reduce((t, r) => t + r.pendingTotal, 0);
  const readyCount = rows.filter((r) => r.payableTotal > 0).length;
  const blockedCount = rows.filter((r) => r.payableTotal > 0 && r.gaps.length > 0).length;

  const settings = await getProgramSettings();

  // Payouts still awaiting their UTR. Money the system thinks has been sent but
  // which nobody has confirmed actually left is the thing worth surfacing first.
  const processing = await db.partnerPayout.findMany({
    where: { status: "PROCESSING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, amount: true, grossAmount: true, tdsAmount: true, tdsRate: true,
      method: true, status: true, createdAt: true, periodLabel: true,
      partner: { select: { id: true, partnerCode: true, user: { select: { name: true } } } },
    },
  });

  return (
    <div className="space-y-4">
      <PartnerTabs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Payout Cycle</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5 max-w-2xl">
            Har mahine yahan se partners ko payment karein. Commission har owner payment par banta hai —
            approve karne ke baad hi paisa ja sakta hai.
          </p>
          <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
            Cycle date: {settings.payoutDayOfMonth} (agla {nextPayoutDate(settings.payoutDayOfMonth).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})
            {" · "}Min {inr(settings.minPayoutAmount)}
            {" · "}
            <Link href="/dashboard/admin/partners/settings" className="text-violet-600 hover:text-violet-700">
              Settings
            </Link>
          </p>
        </div>
        <BulkPayoutButton />
      </div>

      {/* ── Awaiting UTR ───────────────────────────────────────── */}
      {processing.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-200">
            <Clock size={16} className="text-amber-600" />
            <h2 className="font-bold text-amber-900 text-sm">
              {processing.length} payout transfer ka intezaar kar rahe hain
            </h2>
            <span className="text-xs text-amber-700 ml-auto">
              Transfer karke UTR daalein — tabhi partner ko confirm hoga
            </span>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-amber-100">
              {processing.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/admin/partners/${p.partner.id}`} className="font-semibold text-slate-900 hover:text-violet-600">
                      {p.partner.user.name}
                    </Link>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.partner.partnerCode}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {p.method}
                    {p.periodLabel ? ` · ${p.periodLabel}` : ""}
                    <div>{fmtDate(p.createdAt)}</div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-bold text-slate-900">{inr(p.amount)}</div>
                    {p.tdsAmount > 0 && (
                      <div className="text-[11px] text-slate-500">
                        gross {inr(p.grossAmount)} − TDS {p.tdsRate}% {inr(p.tdsAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <PayoutRowActions payoutId={p.id} status={p.status} amount={p.amount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {blockedCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-2xs">
          <AlertTriangle size={16} />
          {blockedCount} partner ka balance to hai par KYC adhoori hai — unka payout nahi ban sakta.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "Abhi dena hai", value: inr(totalPayable), sub: `${readyCount} partner ready`, Icon: Wallet, textCls: "text-emerald-600", borderCls: "border-slate-200/80", iconBg: "bg-emerald-50 text-emerald-600" },
          { label: "Approval baaki", value: inr(totalPending), sub: "review karna hai", Icon: AlertTriangle, textCls: "text-amber-600", borderCls: "border-slate-200/80", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Partners", value: String(rows.length), sub: "jinka bakaya hai", Icon: Users, textCls: "text-blue-600", borderCls: "border-slate-200/80", iconBg: "bg-blue-50 text-blue-600" },
          { label: "Kul bakaya", value: inr(totalPayable + totalPending), sub: "approved + pending", Icon: IndianRupee, textCls: "text-violet-600", borderCls: "border-slate-200/80", iconBg: "bg-violet-50 text-violet-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
              <div className={`p-2 rounded-lg border border-slate-200/60 ${s.iconBg}`}><s.Icon size={14} /></div>
            </div>
            <div className={`text-xl font-black leading-none ${s.textCls}`}>{s.value}</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">{s.sub}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
          <Wallet className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="font-bold text-slate-700">Kisi partner ka kuch bakaya nahi</p>
          <p className="text-sm text-slate-500 mt-1">Jab koi owner plan lega ya renew karega, commission yahan aa jayega.</p>
        </div>
      ) : (
        <>
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Partner</th>
                  <th className="px-4 py-2.5 font-bold text-center">Is mahine</th>
                  <th className="px-4 py-2.5 font-bold text-right">Approval baaki</th>
                  <th className="px-4 py-2.5 font-bold text-right">Dena hai</th>
                  <th className="px-4 py-2.5 font-bold">Pichla payout</th>
                  <th className="px-4 py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/partners/${r.id}`} className="font-bold text-xs uppercase tracking-tight text-slate-900 hover:text-violet-700 transition-colors">
                        {r.user.name}
                      </Link>
                      <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">{r.partnerCode}</div>
                      {!r.hasPayoutDetails && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 shadow-2xs text-amber-700 tracking-wider uppercase">
                          <AlertTriangle size={10} /> UPI/bank missing
                        </span>
                      )}
                      {r.status !== "APPROVED" && (
                        <span className="inline-block mt-1 ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 tracking-wider uppercase">
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 font-bold">{r.thisMonthCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">
                      {r.pendingTotal > 0 ? `${inr(r.pendingTotal)} (${r.pendingCount})` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {r.payableTotal > 0 ? inr(r.payableTotal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {r.payouts[0] ? `${inr(r.payouts[0].amount)} · ${fmtDate(r.payouts[0].paidAt)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* If all docs are present but admin hasn't verified yet — show quick verify */}
                      {!r.kycVerifiedAt && r.kycAllFilled && r.payableTotal > 0 ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <QuickKycVerifyButton partnerId={r.id} />
                          <Link
                            href={`/dashboard/admin/partners/${r.id}`}
                            className="text-[9px] text-slate-400 hover:text-violet-600 font-bold uppercase tracking-wider"
                          >
                            Detail →
                          </Link>
                        </div>
                      ) : r.gaps.length > 0 && r.payableTotal > 0 ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <Link
                            href={`/dashboard/admin/partners/${r.id}`}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold hover:bg-amber-100 transition-colors"
                          >
                            <ShieldAlert size={11} /> KYC Incomplete
                          </Link>
                          <span className="text-[9px] text-amber-600">{r.gaps.filter(g => g !== "admin verification").slice(0,2).join(", ")}</span>
                        </div>
                      ) : (
                        <CreatePayoutButton
                          partnerId={r.id}
                          count={r.payableCount}
                          amount={r.payableTotal}
                          hasPayoutDetails={r.hasPayoutDetails}
                          kycGaps={r.gaps}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2.5 md:hidden">
          {rows.map((r) => (
            <div key={`mob-${r.id}`} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <Link href={`/dashboard/admin/partners/${r.id}`} className="font-bold text-sm uppercase tracking-tight text-slate-900 truncate block">
                    {r.user.name}
                  </Link>
                  <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">{r.partnerCode}</div>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {!r.hasPayoutDetails && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-700">
                        <AlertTriangle size={10} /> UPI/bank nahi
                      </span>
                    )}
                    {r.status !== "APPROVED" && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Dena hai</div>
                  <div className="text-sm font-bold text-slate-900 leading-none">{r.payableTotal > 0 ? inr(r.payableTotal) : "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100 text-center bg-slate-50/60 rounded-lg">
                <div className="truncate px-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Is mahine</div>
                  <div className="text-[10px] font-semibold text-slate-600 truncate">{r.thisMonthCount}</div>
                </div>
                <div className="border-l border-slate-200/80 truncate px-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Baaki (Apprv)</div>
                  <div className="text-[10px] font-semibold text-amber-700 truncate">{r.pendingTotal > 0 ? inr(r.pendingTotal) : "—"}</div>
                </div>
                <div className="border-l border-slate-200/80 truncate px-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Last Payout</div>
                  <div className="text-[9px] font-semibold text-slate-500 truncate">{r.payouts[0] ? `${inr(r.payouts[0].amount)}` : "—"}</div>
                </div>
              </div>
              <div className="mt-0.5 flex justify-end">
                {!r.kycVerifiedAt && r.kycAllFilled && r.payableTotal > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    <QuickKycVerifyButton partnerId={r.id} />
                    <Link
                      href={`/dashboard/admin/partners/${r.id}`}
                      className="text-[9px] text-slate-400 hover:text-violet-600 font-bold uppercase tracking-wider"
                    >
                      Detail →
                    </Link>
                  </div>
                ) : r.gaps.length > 0 && r.payableTotal > 0 ? (
                  <Link
                    href={`/dashboard/admin/partners/${r.id}`}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold"
                  >
                    <ShieldAlert size={11} /> KYC Incomplete →
                  </Link>
                ) : (
                  <CreatePayoutButton
                    partnerId={r.id}
                    count={r.payableCount}
                    amount={r.payableTotal}
                    hasPayoutDetails={r.hasPayoutDetails}
                    kycGaps={r.gaps}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
        App sirf payout <b>record</b> karta hai — asli transfer aapko apne bank/UPI se karna hoga.
      </p>
    </div>
  );
}
