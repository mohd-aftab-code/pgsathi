import { db } from "@/lib/db";
import { Handshake, Eye, Phone } from "lucide-react";
import { AdminPartnerActions } from "@/components/dashboard/AdminPartnerActions";
import { PartnerTabs } from "@/components/dashboard/PartnerTabs";

export const metadata = { title: "Partners — Admin | PGSathi" };

const TYPE_LABEL: Record<string, string> = {
  FREELANCER: "Freelancer", CHANNEL_PARTNER: "Channel Partner",
  MARKETING_EXECUTIVE: "Marketing Exec", SALES_EXECUTIVE: "Sales Exec", SUB_BROKER: "Sub Broker",
};
const statusStyle: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200", PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200", SUSPENDED: "bg-neutral-200 text-neutral-700 border-neutral-300",
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
        user: { select: { name: true, phone: true, email: true, _count: { select: { listings: true } } } },
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
      className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap transition-all shadow-2xs ${
        status === val
          ? "bg-slate-900 text-white shadow-xs"
          : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label} <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${status === val ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{n}</span>
    </a>
  );

  return (
    <div className="space-y-4">
      <PartnerTabs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Partners</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Partner applications review karein aur accounts manage karein.</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
        {tab("All", "", counts.reduce((s, c) => s + c._count._all, 0))}
        {tab("Pending", "PENDING", countBy("PENDING"))}
        {tab("Approved", "APPROVED", countBy("APPROVED"))}
        {tab("Rejected", "REJECTED", countBy("REJECTED"))}
        {tab("Suspended", "SUSPENDED", countBy("SUSPENDED"))}
      </div>

      {partners.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center text-slate-500 shadow-xs">Koi partner nahi mila.</div>
      ) : (
        <>
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hidden md:block">
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
          <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {partners.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
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
                <td className="px-4 py-2 text-center font-black text-neutral-700">{p._count.listings + (p.user?._count?.listings || 0)}</td>
                <td className="px-4 py-2 text-center font-black text-neutral-700">{p._count.earnings}</td>
                  <td className="px-4 py-2"><span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-xl tracking-wider uppercase ${statusStyle[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/dashboard/admin/partners/${p.id}`}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                      >
                        <Eye size={12} /> Details
                      </a>
                      <AdminPartnerActions id={p.id} status={p.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Showing <span className="font-bold text-slate-700">{(page - 1) * take + 1}</span> to <span className="font-bold text-slate-700">{Math.min(page * take, totalCount)}</span> of <span className="font-bold text-slate-700">{totalCount}</span>
              </div>
              <div className="flex gap-1.5">
                {page > 1 && (
                  <a href={`?status=${status}&page=${page - 1}`} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-violet-700 bg-white border border-slate-200/80 shadow-2xs px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                    Prev
                  </a>
                )}
                {page < totalPages && (
                  <a href={`?status=${status}&page=${page + 1}`} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-violet-700 bg-white border border-slate-200/80 shadow-2xs px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {partners.map((p) => (
            <div key={`mob-${p.id}`} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <a href={`/dashboard/admin/partners/${p.id}`} className="font-bold text-sm uppercase tracking-tight text-slate-900 hover:text-violet-700 transition-colors truncate block">
                    {p.user.name}
                  </a>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate mt-0.5">
                    {p.user.phone ?? "No phone"} {p.user.email ? `· ${p.user.email}` : ""}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                    {p.partnerCode}{p.city ? ` · ${p.city}` : ""}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {p.user.phone && (
                    <a
                      href={`tel:${p.user.phone}`}
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition-colors"
                      title="Call Partner"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${statusStyle[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100 text-center bg-slate-50 rounded-lg">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Owners</div>
                  <div className="text-xs font-bold text-slate-800">{p._count.owners}</div>
                </div>
                <div className="border-l border-slate-200/80">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PGs</div>
                  <div className="text-xs font-bold text-slate-800">{p._count.listings + (p.user?._count?.listings || 0)}</div>
                </div>
                <div className="border-l border-slate-200/80">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Earnings</div>
                  <div className="text-xs font-bold text-slate-800">{p._count.earnings}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <a
                  href={`/dashboard/admin/partners/${p.id}`}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors shadow-2xs"
                >
                  <Eye size={13} /> View
                </a>
                <AdminPartnerActions id={p.id} status={p.status} />
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {page > 1 && (
                <a href={`?status=${status}&page=${page - 1}`} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs uppercase tracking-wider">
                  Prev
                </a>
              )}
              {page < totalPages && (
                <a href={`?status=${status}&page=${page + 1}`} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs uppercase tracking-wider">
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
