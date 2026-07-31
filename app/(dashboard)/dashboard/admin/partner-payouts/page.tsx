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
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Payout Cycle</h1>
            <p className="text-neutral-300 text-sm max-w-2xl">
              Har mahine yahan se partners ko payment karein. Commission har owner payment par banta hai —
              approve karne ke baad hi paisa ja sakta hai. Payout pehle <b>PROCESSING</b> banta hai; UTR
              record karne par hi COMPLETED hota hai.
            </p>
            <p className="text-neutral-400 text-xs mt-2">
              Cycle date: har mahine ki {settings.payoutDayOfMonth} tareekh (agla{" "}
              {nextPayoutDate(settings.payoutDayOfMonth).toLocaleDateString("en-IN", { day: "numeric", month: "long" })})
              {" · "}minimum {inr(settings.minPayoutAmount)}
              {" · "}
              <Link href="/dashboard/admin/partner-program" className="underline hover:text-white">
                settings badlein
              </Link>
            </p>
          </div>
          <BulkPayoutButton />
        </div>
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
          { label: "Abhi dena hai", value: inr(totalPayable), sub: `${readyCount} partner ready`, Icon: Wallet, cls: "text-green-600 bg-green-50" },
          { label: "Approval baaki", value: inr(totalPending), sub: "review karna hai", Icon: AlertTriangle, cls: "text-amber-600 bg-amber-50" },
          { label: "Partners", value: String(rows.length), sub: "jinka kuch bakaya hai", Icon: Users, cls: "text-blue-600 bg-blue-50" },
          { label: "Kul bakaya", value: inr(totalPayable + totalPending), sub: "approved + pending", Icon: IndianRupee, cls: "text-violet-600 bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-neutral-500">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.cls}`}><s.Icon size={14} /></div>
            </div>
            <div className="text-xl font-bold text-neutral-900">{s.value}</div>
            <div className="text-[11px] text-neutral-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
          <Wallet className="mx-auto text-neutral-300 mb-3" size={32} />
          <p className="font-bold text-neutral-700">Kisi partner ka kuch bakaya nahi</p>
          <p className="text-sm text-neutral-500 mt-1">Jab koi owner plan lega ya renew karega, commission yahan aa jayega.</p>
        </div>
      ) : (
        <>
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                  <th className="px-5 py-3 font-bold">Partner</th>
                  <th className="px-3 py-3 font-bold text-center">Is mahine</th>
                  <th className="px-3 py-3 font-bold text-right">Approval baaki</th>
                  <th className="px-3 py-3 font-bold text-right">Dena hai</th>
                  <th className="px-3 py-3 font-bold">Pichla payout</th>
                  <th className="px-5 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/admin/partners/${r.id}`} className="font-semibold text-neutral-900 hover:text-primary-600">
                        {r.user.name}
                      </Link>
                      <div className="text-xs text-neutral-400 tracking-widest">{r.partnerCode}</div>
                      {!r.hasPayoutDetails && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                          <AlertTriangle size={10} /> UPI/bank nahi bhara
                        </span>
                      )}
                      {r.status !== "APPROVED" && (
                        <span className="inline-block mt-1 ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600">
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-neutral-600">{r.thisMonthCount}</td>
                    <td className="px-3 py-3 text-right text-amber-700">
                      {r.pendingTotal > 0 ? `${inr(r.pendingTotal)} (${r.pendingCount})` : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-extrabold text-neutral-900">
                      {r.payableTotal > 0 ? inr(r.payableTotal) : "—"}
                    </td>
                    <td className="px-3 py-3 text-neutral-500 text-xs">
                      {r.payouts[0] ? `${inr(r.payouts[0].amount)} · ${fmtDate(r.payouts[0].paidAt)}` : "kabhi nahi"}
                    </td>
                    <td className="px-5 py-3 text-right">
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
            <div key={`mob-${r.id}`} className="bg-white border border-neutral-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <Link href={`/dashboard/admin/partners/${r.id}`} className="font-bold text-sm text-neutral-900 truncate block">
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

      <p className="text-xs text-neutral-400">
        App sirf payout <b>record</b> karta hai — asli transfer aapko apne bank/UPI se karna hoga.
      </p>
    </div>
  );
}
