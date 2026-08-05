import { db } from "@/lib/db";
import { Handshake } from "lucide-react";
import { AdminPartnerActions } from "@/components/dashboard/AdminPartnerActions";

export const metadata = { title: "Partners — Admin | PGSathi" };

const TYPE_LABEL: Record<string, string> = {
  FREELANCER: "Freelancer", CHANNEL_PARTNER: "Channel Partner",
  MARKETING_EXECUTIVE: "Marketing Exec", SALES_EXECUTIVE: "Sales Exec", SUB_BROKER: "Sub Broker",
};
const statusStyle: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700", PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700", SUSPENDED: "bg-neutral-200 text-neutral-600",
};

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {};
  if (status) where.status = status;

  const [partners, counts, totalCount] = await Promise.all([
    db.partnerProfile.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take,
      select: {
        id: true, partnerCode: true, type: true, status: true, city: true, createdAt: true,
        user: { select: { name: true, phone: true, email: true } },
        _count: { select: { listings: true, earnings: true, owners: true } },
      },
    }),
    db.partnerProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    db.partnerProfile.count({ where }),
  ]);

  const countBy = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const totalPages = Math.ceil(totalCount / take);

  const tab = (label: string, val: string, n: number) => (
    <a
      href={val ? `/dashboard/admin/partners?status=${val}` : "/dashboard/admin/partners"}
      className={`h-8 px-3 rounded-xl text-[10px] font-black inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors shadow-sm ${
        status === val
          ? "bg-neutral-900 text-white"
          : "bg-white/60 backdrop-blur-md border border-neutral-200/60 text-neutral-600 hover:bg-white/80 hover:text-neutral-900"
      }`}
    >
      {label} <span className={`text-[9px] ${status === val ? "text-white/70" : "text-neutral-400"}`}>{n}</span>
    </a>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Partners</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Partner applications approve karein aur accounts manage karein.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tab("All", "", counts.reduce((s, c) => s + c._count._all, 0))}
        {tab("Pending", "PENDING", countBy("PENDING"))}
        {tab("Approved", "APPROVED", countBy("APPROVED"))}
        {tab("Rejected", "REJECTED", countBy("REJECTED"))}
        {tab("Suspended", "SUSPENDED", countBy("SUSPENDED"))}
      </div>

      {partners.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 py-16 text-center text-neutral-500 shadow-sm">Koi partner nahi mila.</div>
      ) : (
        <>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
          <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
            <tr>
              <th className="px-4 py-2 font-bold">Partner</th>
              <th className="px-4 py-2 font-bold">Type</th>
              <th className="px-4 py-2 font-bold">Contact</th>
              <th className="px-4 py-2 font-bold text-center">Owners</th>
              <th className="px-4 py-2 font-bold text-center">PGs</th>
              <th className="px-4 py-2 font-bold text-center">Earnings</th>
              <th className="px-4 py-2 font-bold">Status</th>
              <th className="px-4 py-2 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
              {partners.map((p) => (
              <tr key={p.id} className="hover:bg-white/80 transition-colors group">
                <td className="px-4 py-2">
                  <a href={`/dashboard/admin/partners/${p.id}`} className="font-black text-xs tracking-tight text-neutral-900 hover:text-violet-700 transition-colors uppercase">
                    {p.user.name}
                  </a>
                  <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">{p.partnerCode}{p.city ? ` · ${p.city}` : ""}</div>
                </td>
                <td className="px-4 py-2 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">{TYPE_LABEL[p.type] ?? p.type}</td>
                <td className="px-4 py-2 text-neutral-600">
                  <div className="font-bold text-[10px] uppercase tracking-wider">{p.user.phone ?? "—"}</div>
                  <div className="text-[9px] text-neutral-400 truncate max-w-[140px]">{p.user.email}</div>
                </td>
                <td className="px-4 py-2 text-center font-black text-neutral-700">{p._count.owners}</td>
                <td className="px-4 py-2 text-center font-black text-neutral-700">{p._count.listings}</td>
                <td className="px-4 py-2 text-center font-black text-neutral-700">{p._count.earnings}</td>
                  <td className="px-4 py-2"><span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${statusStyle[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                      <AdminPartnerActions id={p.id} status={p.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-neutral-200/60 bg-white/40 flex items-center justify-between">
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Showing <span className="font-black text-neutral-600">{(page - 1) * take + 1}</span> to <span className="font-black text-neutral-600">{Math.min(page * take, totalCount)}</span> of <span className="font-black text-neutral-600">{totalCount}</span>
              </div>
              <div className="flex gap-1">
                {page > 1 && (
                  <a href={`?status=${status}&page=${page - 1}`} className="flex items-center gap-1 text-[10px] font-black text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md border border-neutral-200/60 shadow-sm px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider">
                    Prev
                  </a>
                )}
                {page < totalPages && (
                  <a href={`?status=${status}&page=${page + 1}`} className="flex items-center gap-1 text-[10px] font-black text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md border border-neutral-200/60 shadow-sm px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider">
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {partners.map((p) => (
            <div key={`mob-${p.id}`} className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <a href={`/dashboard/admin/partners/${p.id}`} className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate block">
                    {p.user.name}
                  </a>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider truncate">{p.user.phone ?? "No phone"} · {p.user.email}</div>
                  <div className="text-[9px] text-neutral-400 font-black tracking-widest uppercase mt-0.5">{p.partnerCode}{p.city ? ` · ${p.city}` : ""}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border shadow-sm ${statusStyle[p.status]}`}>{p.status}</span>
                  <span className="text-[9px] font-black text-neutral-500 bg-white/60 border border-neutral-200/60 px-1.5 py-0.5 rounded-md uppercase shadow-sm">{TYPE_LABEL[p.type] ?? p.type}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50/50 text-center">
                <div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Owners</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.owners}</div>
                </div>
                <div className="border-l border-neutral-100/60">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">PGs</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.listings}</div>
                </div>
                <div className="border-l border-neutral-100/60">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Earnings</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.earnings}</div>
                </div>
              </div>
              <div className="mt-0.5 flex justify-end">
                <AdminPartnerActions id={p.id} status={p.status} />
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {page > 1 && (
                <a href={`?status=${status}&page=${page - 1}`} className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
                  Prev
                </a>
              )}
              {page < totalPages && (
                <a href={`?status=${status}&page=${page + 1}`} className="flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
                  Next
                </a>
              )}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
