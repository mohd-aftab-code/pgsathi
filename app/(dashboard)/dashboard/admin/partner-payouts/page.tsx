import Link from "next/link";
import { db } from "@/lib/db";
import { Wallet, AlertTriangle, IndianRupee, Users, Clock } from "lucide-react";
import { CreatePayoutButton } from "@/components/dashboard/CreatePayoutButton";
import { PayoutRowActions, BulkPayoutButton } from "@/components/dashboard/PayoutActions";
import { kycGaps } from "@/lib/partner-payouts";
import { getProgramSettings, nextPayoutDate } from "@/lib/partner-settings";

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

  const partners = await db.partnerProfile.findMany({
    where: { earnings: { some: { status: { in: ["PENDING", "APPROVED"] } } } },
    select: {
      id: true,
      partnerCode: true,
      status: true,
      upiId: true,
      bankAccountNo: true,
      panNumber: true,
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
  });

  const rows = partners
    .map((p) => {
      const payable = p.earnings.filter((e) => e.status === "APPROVED" && !e.payoutId);
      const pending = p.earnings.filter((e) => e.status === "PENDING");
      return {
        ...p,
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
            <Link href="/dashboard/admin/partner-program" className="text-violet-600 hover:text-violet-700">
              Settings
            </Link>
          </p>
        </div>
        <BulkPayoutButton />
      </div>

      {/* ── Awaiting UTR ───────────────────────────────────────── */}
      {processing.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden">
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
                    <Link href={`/dashboard/admin/partners/${p.partner.id}`} className="font-semibold text-neutral-900 hover:text-violet-600">
                      {p.partner.user.name}
                    </Link>
                    <div className="text-xs text-neutral-400 tracking-widest">{p.partner.partnerCode}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-500">
                    {p.method}
                    {p.periodLabel ? ` · ${p.periodLabel}` : ""}
                    <div>{fmtDate(p.createdAt)}</div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-bold text-neutral-900">{inr(p.amount)}</div>
                    {p.tdsAmount > 0 && (
                      <div className="text-[11px] text-neutral-500">
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
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          <AlertTriangle size={16} />
          {blockedCount} partner ka balance to hai par KYC adhoori hai — unka payout nahi ban sakta.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Abhi dena hai", value: inr(totalPayable), sub: `${readyCount} partner ready`, Icon: Wallet, textCls: "text-emerald-600", borderCls: "border-emerald-200", iconBg: "bg-emerald-100" },
          { label: "Approval baaki", value: inr(totalPending), sub: "review karna hai", Icon: AlertTriangle, textCls: "text-amber-600", borderCls: "border-amber-200", iconBg: "bg-amber-100" },
          { label: "Partners", value: String(rows.length), sub: "jinka bakaya hai", Icon: Users, textCls: "text-blue-600", borderCls: "border-blue-200", iconBg: "bg-blue-100" },
          { label: "Kul bakaya", value: inr(totalPayable + totalPending), sub: "approved + pending", Icon: IndianRupee, textCls: "text-violet-600", borderCls: "border-violet-200", iconBg: "bg-violet-100" },
        ].map((s) => (
          <div key={s.label} className={`bg-white/60 backdrop-blur-md rounded-2xl border ${s.borderCls} p-3.5 shadow-sm`}>
            <div className="flex items-start justify-between mb-1.5">
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.iconBg}`}><s.Icon size={12} className={s.textCls} /></div>
            </div>
            <div className={`text-xl font-black leading-none ${s.textCls}`}>{s.value}</div>
            <div className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">{s.sub}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-dashed border-neutral-300 p-12 text-center shadow-sm">
          <Wallet className="mx-auto text-neutral-300 mb-3" size={32} />
          <p className="font-bold text-neutral-700">Kisi partner ka kuch bakaya nahi</p>
          <p className="text-sm text-neutral-500 mt-1">Jab koi owner plan lega ya renew karega, commission yahan aa jayega.</p>
        </div>
      ) : (
        <>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
                <tr>
                  <th className="px-4 py-2 font-bold">Partner</th>
                  <th className="px-4 py-2 font-bold text-center">Is mahine</th>
                  <th className="px-4 py-2 font-bold text-right">Approval baaki</th>
                  <th className="px-4 py-2 font-bold text-right">Dena hai</th>
                  <th className="px-4 py-2 font-bold">Pichla payout</th>
                  <th className="px-4 py-2 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/80 transition-colors group">
                    <td className="px-4 py-2">
                      <Link href={`/dashboard/admin/partners/${r.id}`} className="font-black text-xs uppercase tracking-tight text-neutral-900 hover:text-violet-700 transition-colors">
                        {r.user.name}
                      </Link>
                      <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">{r.partnerCode}</div>
                      {!r.hasPayoutDetails && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-200/60 shadow-sm text-amber-700 tracking-wider uppercase">
                          <AlertTriangle size={10} /> UPI/bank missing
                        </span>
                      )}
                      {r.status !== "APPROVED" && (
                        <span className="inline-block mt-0.5 ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-200 text-neutral-600 tracking-wider uppercase">
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center text-neutral-600 font-bold">{r.thisMonthCount}</td>
                    <td className="px-4 py-2 text-right font-bold text-amber-600">
                      {r.pendingTotal > 0 ? `${inr(r.pendingTotal)} (${r.pendingCount})` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-black text-neutral-900">
                      {r.payableTotal > 0 ? inr(r.payableTotal) : "—"}
                    </td>
                    <td className="px-4 py-2 text-neutral-500 font-medium">
                      {r.payouts[0] ? `${inr(r.payouts[0].amount)} · ${fmtDate(r.payouts[0].paidAt)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <CreatePayoutButton
                        partnerId={r.id}
                        count={r.payableCount}
                        amount={r.payableTotal}
                        hasPayoutDetails={r.hasPayoutDetails}
                        kycGaps={r.gaps}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {rows.map((r) => (
            <div key={`mob-${r.id}`} className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <Link href={`/dashboard/admin/partners/${r.id}`} className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate block">
                    {r.user.name}
                  </Link>
                  <div className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">{r.partnerCode}</div>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {!r.hasPayoutDetails && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        <AlertTriangle size={10} /> UPI/bank nahi
                      </span>
                    )}
                    {r.status !== "APPROVED" && (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600">
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Dena hai</div>
                  <div className="text-sm font-extrabold text-neutral-900 leading-none">{r.payableTotal > 0 ? inr(r.payableTotal) : "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50 text-center">
                <div className="truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Is mahine</div>
                  <div className="text-[10px] font-semibold text-neutral-600 truncate">{r.thisMonthCount}</div>
                </div>
                <div className="border-l border-neutral-100 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Baaki (Apprv)</div>
                  <div className="text-[10px] font-semibold text-amber-700 truncate">{r.pendingTotal > 0 ? inr(r.pendingTotal) : "—"}</div>
                </div>
                <div className="border-l border-neutral-100 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Last Payout</div>
                  <div className="text-[9px] font-semibold text-neutral-500 truncate">{r.payouts[0] ? `${inr(r.payouts[0].amount)}` : "—"}</div>
                </div>
              </div>
              <div className="mt-0.5 flex justify-end">
                <CreatePayoutButton
                  partnerId={r.id}
                  count={r.payableCount}
                  amount={r.payableTotal}
                  hasPayoutDetails={r.hasPayoutDetails}
                        kycGaps={r.gaps}
                />
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
