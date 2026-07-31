import { db } from "@/lib/db";
import { IndianRupee } from "lucide-react";
import { AdminEarningActions } from "@/components/dashboard/AdminEarningActions";

export const metadata = { title: "Partner Earnings — Admin | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const statusStyle: Record<string, string> = {
  PAID: "bg-green-100 text-green-700", APPROVED: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700", CANCELLED: "bg-neutral-200 text-neutral-500",
};

export default async function AdminPartnerEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "PENDING";
  const page = Math.max(1, parseInt(sp?.page ?? "1") || 1);
  const pageSize = 15;

  const where: any = {};
  if (status && status !== "ALL") where.status = status;

  const [earnings, totalCount, sums] = await Promise.all([
    db.partnerEarning.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, amount: true, status: true, createdAt: true, planNameSnapshot: true,
        onHold: true, holdReason: true, kind: true, commissionRateSnapshot: true, autoApproved: true,
        owner: { select: { name: true } },
        listing: { select: { title: true } },
        partner: { select: { partnerCode: true, user: { select: { name: true } } } },
      },
    }),
    db.partnerEarning.count({ where }),
    db.partnerEarning.groupBy({ by: ["status"], _sum: { amount: true }, _count: { _all: true } }),
  ]);

  const sumBy = (s: string) => sums.find((x: any) => x.status === s)?._sum.amount ?? 0;
  const cntBy = (s: string) => sums.find((x: any) => x.status === s)?._count._all ?? 0;

  const tab = (label: string, val: string) => (
    <a href={`/dashboard/admin/partner-earnings?status=${val}`}
      className={`h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 ${status === val ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
      {label} <span className={`text-xs ${status === val ? "text-white/70" : "text-neutral-400"}`}>{cntBy(val) || (val === "ALL" ? sums.reduce((s: any, x: any) => s + x._count._all, 0) : 0)}</span>
    </a>
  );

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1"><IndianRupee size={22} /> <h1 className="text-2xl font-extrabold">Partner Earnings</h1></div>
        <p className="text-neutral-300 text-sm">Har earning ka amount manually set karein, approve aur pay karein. (Koi commission % nahi.)</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Pending payout</div><div className="text-xl font-bold text-amber-600">{inr(sumBy("PENDING") + sumBy("APPROVED"))}</div></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Paid out</div><div className="text-xl font-bold text-green-600">{inr(sumBy("PAID"))}</div></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4"><div className="text-xs text-neutral-500">Awaiting amount</div><div className="text-xl font-bold text-neutral-900">{cntBy("PENDING")}</div></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tab("Pending", "PENDING")}{tab("Approved", "APPROVED")}{tab("Paid", "PAID")}{tab("Cancelled", "CANCELLED")}{tab("All", "ALL")}
      </div>

      {earnings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center text-neutral-500">Is filter mein koi earning nahi.</div>
      ) : (
        <>
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                <th className="px-5 py-3 font-bold">Partner</th>
                <th className="px-3 py-3 font-bold">Owner</th>
                <th className="px-3 py-3 font-bold">Plan</th>
                <th className="px-3 py-3 font-bold">Date</th>
                <th className="px-3 py-3 font-bold text-right">Amount</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {earnings.map((e: any) => (
                <tr key={e.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-neutral-900">{e.partner.user.name}</div>
                    <div className="text-xs text-neutral-400 tracking-widest">{e.partner.partnerCode}</div>
                  </td>
                  <td className="px-3 py-3 text-neutral-600 max-w-[180px] truncate">{e.owner?.name ?? e.listing?.title ?? "—"}</td>
                  <td className="px-3 py-3 text-neutral-600">{e.planNameSnapshot ?? "—"}</td>
                  <td className="px-3 py-3 text-neutral-500">{fmtDate(e.createdAt)}</td>
                  <td className="px-3 py-3 text-right font-bold text-neutral-900">{inr(e.amount)}</td>
                  <td className="px-3 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusStyle[e.status]}`}>{e.status}</span></td>
                  <td className="px-5 py-3"><AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {earnings.map((e: any) => (
            <div key={`mob-${e.id}`} className="bg-white border border-neutral-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neutral-900 truncate">{e.partner.user.name}</div>
                  <div className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">{e.partner.partnerCode}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusStyle[e.status]}`}>{e.status}</span>
                  <span className="text-[10px] font-bold text-neutral-900">{inr(e.amount)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50 text-center">
                <div className="truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Owner/PG</div>
                  <div className="text-[10px] font-semibold text-neutral-700 truncate">{e.owner?.name ?? e.listing?.title ?? "—"}</div>
                </div>
                <div className="border-l border-neutral-100 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Plan</div>
                  <div className="text-[10px] font-semibold text-neutral-700 truncate">{e.planNameSnapshot ?? "—"}</div>
                </div>
                <div className="border-l border-neutral-100 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Date</div>
                  <div className="text-[10px] font-semibold text-neutral-500 truncate">{fmtDate(e.createdAt)}</div>
                </div>
              </div>
              <div className="mt-0.5">
                <AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} />
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between bg-white border border-neutral-200/80 rounded-2xl px-5 py-3">
          <span className="text-xs text-neutral-500 font-medium">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} earnings
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?status=${status}&page=${page - 1}`}
                className="px-3 py-1.5 text-xs font-bold border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                ← Prev
              </a>
            )}
            {page < Math.ceil(totalCount / pageSize) && (
              <a
                href={`?status=${status}&page=${page + 1}`}
                className="px-3 py-1.5 text-xs font-bold border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
