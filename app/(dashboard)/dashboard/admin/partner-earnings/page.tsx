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
      className={`h-8 px-3 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors ${status === val ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"}`}>
      {label} <span className={`text-[9px] ${status === val ? "text-white/70" : "text-neutral-400"}`}>{cntBy(val) || (val === "ALL" ? sums.reduce((s: any, x: any) => s + x._count._all, 0) : 0)}</span>
    </a>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Partner Earnings</h1>
          <p className="text-neutral-500 text-xs font-medium mt-0.5">Har earning ka amount manually set karein, approve aur pay karein. (Koi commission % nahi.)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-3.5 shadow-sm"><div className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Pending payout</div><div className="text-xl font-black text-amber-600 leading-none mt-1">{inr(sumBy("PENDING") + sumBy("APPROVED"))}</div></div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-3.5 shadow-sm"><div className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Paid out</div><div className="text-xl font-black text-green-600 leading-none mt-1">{inr(sumBy("PAID"))}</div></div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-3.5 shadow-sm"><div className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Awaiting amount</div><div className="text-xl font-black text-neutral-900 leading-none mt-1">{cntBy("PENDING")}</div></div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tab("Pending", "PENDING")}{tab("Approved", "APPROVED")}{tab("Paid", "PAID")}{tab("Cancelled", "CANCELLED")}{tab("All", "ALL")}
      </div>

      {earnings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 py-16 text-center text-neutral-500 shadow-sm">Is filter mein koi earning nahi.</div>
      ) : (
        <>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
            <thead className="bg-neutral-50/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-100">
              <tr>
                <th className="px-4 py-2 font-bold">Partner</th>
                <th className="px-4 py-2 font-bold">Owner</th>
                <th className="px-4 py-2 font-bold">Plan</th>
                <th className="px-4 py-2 font-bold">Date</th>
                <th className="px-4 py-2 font-bold text-right">Amount</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-[11px]">
              {earnings.map((e: any) => (
                <tr key={e.id} className="hover:bg-violet-50/30 transition-colors group">
                  <td className="px-4 py-2">
                    <div className="font-bold text-[13px] text-neutral-900">{e.partner.user.name}</div>
                    <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">{e.partner.partnerCode}</div>
                  </td>
                  <td className="px-4 py-2 text-neutral-600 max-w-[150px] truncate font-medium">{e.owner?.name ?? e.listing?.title ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-600 font-medium">{e.planNameSnapshot ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-500 font-medium">{fmtDate(e.createdAt)}</td>
                  <td className="px-4 py-2 text-right font-black text-neutral-900">{inr(e.amount)}</td>
                  <td className="px-4 py-2"><span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${statusStyle[e.status]}`}>{e.status}</span></td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                      <AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {earnings.map((e: any) => (
            <div key={`mob-${e.id}`} className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-[13px] text-neutral-900 truncate">{e.partner.user.name}</div>
                  <div className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">{e.partner.partnerCode}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${statusStyle[e.status]}`}>{e.status}</span>
                  <span className="text-[10px] font-black text-neutral-900">{inr(e.amount)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50/50 text-center">
                <div className="truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Owner/PG</div>
                  <div className="text-[10px] font-semibold text-neutral-700 truncate">{e.owner?.name ?? e.listing?.title ?? "—"}</div>
                </div>
                <div className="border-l border-neutral-100/60 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Plan</div>
                  <div className="text-[10px] font-semibold text-neutral-700 truncate">{e.planNameSnapshot ?? "—"}</div>
                </div>
                <div className="border-l border-neutral-100/60 truncate px-1">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Date</div>
                  <div className="text-[10px] font-semibold text-neutral-500 truncate">{fmtDate(e.createdAt)}</div>
                </div>
              </div>
              <div className="mt-0.5 flex justify-end">
                <AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} />
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
            Showing <span className="font-bold">{(page - 1) * pageSize + 1}</span>–<span className="font-bold">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-bold">{totalCount}</span> earnings
          </div>
          <div className="flex gap-1">
            {page > 1 && (
              <a
                href={`?status=${status}&page=${page - 1}`}
                className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-violet-700 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-md transition-all uppercase tracking-wider"
              >
                Prev
              </a>
            )}
            {page < Math.ceil(totalCount / pageSize) && (
              <a
                href={`?status=${status}&page=${page + 1}`}
                className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-violet-700 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-md transition-all uppercase tracking-wider"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
