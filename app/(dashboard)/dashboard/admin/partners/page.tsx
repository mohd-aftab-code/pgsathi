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
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";

  const where: any = {};
  if (status) where.status = status;

  const [partners, counts] = await Promise.all([
    db.partnerProfile.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, partnerCode: true, type: true, status: true, city: true, createdAt: true,
        user: { select: { name: true, phone: true, email: true } },
        // `owners` is the commission-bearing relation — a partner with many PGs
        // but few owners generates far less than the PG count suggests.
        _count: { select: { listings: true, earnings: true, owners: true } },
      },
    }),
    db.partnerProfile.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countBy = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  const tab = (label: string, val: string, n: number) => (
    <a
      href={val ? `/dashboard/admin/partners?status=${val}` : "/dashboard/admin/partners"}
      className={`h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 ${status === val ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
    >
      {label} <span className={`text-xs ${status === val ? "text-white/70" : "text-neutral-400"}`}>{n}</span>
    </a>
  );

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1"><Handshake size={22} /> <h1 className="text-2xl font-extrabold">Partners</h1></div>
        <p className="text-neutral-300 text-sm">Partner applications approve karein aur accounts manage karein.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tab("All", "", counts.reduce((s, c) => s + c._count._all, 0))}
        {tab("Pending", "PENDING", countBy("PENDING"))}
        {tab("Approved", "APPROVED", countBy("APPROVED"))}
        {tab("Rejected", "REJECTED", countBy("REJECTED"))}
        {tab("Suspended", "SUSPENDED", countBy("SUSPENDED"))}
      </div>

      {partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center text-neutral-500">Koi partner nahi mila.</div>
      ) : (
        <>
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                <th className="px-5 py-3 font-bold">Partner</th>
                <th className="px-3 py-3 font-bold">Type</th>
                <th className="px-3 py-3 font-bold">Contact</th>
                <th className="px-3 py-3 font-bold text-center">Owners</th>
                <th className="px-3 py-3 font-bold text-center">PGs</th>
                <th className="px-3 py-3 font-bold text-center">Earnings</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <a href={`/dashboard/admin/partners/${p.id}`} className="font-semibold text-neutral-900 hover:text-primary-600">
                      {p.user.name}
                    </a>
                    <div className="text-xs text-neutral-400 tracking-widest">{p.partnerCode}{p.city ? ` · ${p.city}` : ""}</div>
                  </td>
                  <td className="px-3 py-3 text-neutral-600">{TYPE_LABEL[p.type] ?? p.type}</td>
                  <td className="px-3 py-3 text-neutral-600">
                    <div>{p.user.phone ?? "—"}</div>
                    <div className="text-xs text-neutral-400 truncate max-w-[160px]">{p.user.email}</div>
                  </td>
                  <td className="px-3 py-3 text-center font-semibold text-neutral-700">{p._count.owners}</td>
                  <td className="px-3 py-3 text-center font-semibold text-neutral-700">{p._count.listings}</td>
                  <td className="px-3 py-3 text-center font-semibold text-neutral-700">{p._count.earnings}</td>
                  <td className="px-3 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusStyle[p.status]}`}>{p.status}</span></td>
                  <td className="px-5 py-3"><AdminPartnerActions id={p.id} status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {partners.map((p) => (
            <div key={`mob-${p.id}`} className="bg-white border border-neutral-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <a href={`/dashboard/admin/partners/${p.id}`} className="font-bold text-sm text-neutral-900 truncate block">
                    {p.user.name}
                  </a>
                  <div className="text-[10px] text-neutral-500 truncate">{p.user.phone ?? "No phone"} · {p.user.email}</div>
                  <div className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">{p.partnerCode}{p.city ? ` · ${p.city}` : ""}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusStyle[p.status]}`}>{p.status}</span>
                  <span className="text-[9px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{TYPE_LABEL[p.type] ?? p.type}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50 text-center">
                <div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Owners</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.owners}</div>
                </div>
                <div className="border-l border-neutral-100">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">PGs</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.listings}</div>
                </div>
                <div className="border-l border-neutral-100">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Earnings</div>
                  <div className="text-xs font-bold text-neutral-700">{p._count.earnings}</div>
                </div>
              </div>
              <div className="mt-0.5">
                <AdminPartnerActions id={p.id} status={p.status} />
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
