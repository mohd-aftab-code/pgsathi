import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "Audit Logs — Admin | PGSathi" };

const fmtDateTime = (d: Date) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Friendly labels for the action keys the code writes. */
const ACTION_LABEL: Record<string, string> = {
  "earning.amount.updated": "Earning amount changed",
  "earning.approved": "Earning approved",
  "earning.paid": "Earning marked paid",
  "earning.cancelled": "Earning cancelled",
  "payout.created": "Payout created",
  "partner.approved": "Partner approved",
  "partner.rejected": "Partner rejected",
  "partner.suspended": "Partner suspended",
  "partner.pending": "Partner set to pending",
};

const actionStyle = (a: string) =>
  a.startsWith("payout") ? "bg-green-100 text-green-700"
  : a.includes("cancel") || a.includes("suspend") || a.includes("reject") ? "bg-red-100 text-red-700"
  : a.includes("approve") || a.includes("paid") ? "bg-blue-100 text-blue-700"
  : "bg-amber-100 text-amber-700";

/** Renders a before/after JSON blob as short "key: value" chips. */
function Snapshot({ data, tone }: { data: any; tone: "before" | "after" }) {
  if (!data || typeof data !== "object") return <span className="text-neutral-300">—</span>;
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return <span className="text-neutral-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.slice(0, 4).map(([k, v]) => (
        <span
          key={k}
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            tone === "before" ? "bg-neutral-100 text-neutral-600" : "bg-violet-50 text-violet-700"
          }`}
        >
          {k}: {typeof v === "object" ? JSON.stringify(v).slice(0, 24) : String(v).slice(0, 24)}
        </span>
      ))}
    </div>
  );
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const entity = sp.entity ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const pageSize = 30;

  const where: any = {};
  if (entity) where.entity = entity;

  const [total, logs, admins] = await Promise.all([
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true } }),
  ]);
  const adminName = new Map(admins.map((a) => [a.id, a.name]));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tab = (label: string, val: string) => (
    <Link
      href={val ? `/dashboard/admin/audit-logs?entity=${val}` : "/dashboard/admin/audit-logs"}
      className={`h-8 px-3 rounded-2xl text-[10px] font-bold inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
        entity === val ? "bg-neutral-900 text-white" : "bg-white/60 backdrop-blur-md border border-neutral-200/60 text-neutral-600 hover:bg-white/80 hover:text-neutral-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Audit Logs</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
            Har money aur partner action ka record — kisne, kab, kya se kya kiya. {total} entries.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tab("All", "")}
        {tab("Earnings", "PartnerEarning")}
        {tab("Payouts", "PartnerPayout")}
        {tab("Partners", "PartnerProfile")}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 py-16 text-center text-neutral-500 shadow-sm">
          Abhi koi audit entry nahi.
        </div>
      ) : (
        <>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
              <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
                <tr>
                  <th className="px-4 py-2 font-bold">When</th>
                  <th className="px-4 py-2 font-bold">Admin</th>
                  <th className="px-4 py-2 font-bold">Action</th>
                  <th className="px-4 py-2 font-bold">Entity</th>
                  <th className="px-4 py-2 font-bold">Before → After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/80 align-top transition-colors">
                    <td className="px-4 py-2 text-[9px] font-bold text-neutral-500 whitespace-nowrap uppercase tracking-wider">{fmtDateTime(l.createdAt)}</td>
                    <td className="px-4 py-2 text-neutral-900 font-black text-xs uppercase tracking-tight">{l.actor ?? adminName.get(l.adminId) ?? `#${l.adminId}`}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-xl tracking-wider uppercase border shadow-sm ${actionStyle(l.action)}`}>
                        {ACTION_LABEL[l.action] ?? l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-neutral-600 whitespace-nowrap font-black text-[9px] uppercase tracking-wider">
                      {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-start gap-1.5">
                        <Snapshot data={l.before} tone="before" />
                        <ArrowRight size={10} className="text-neutral-400 shrink-0 mt-0.5" />
                        <Snapshot data={l.after} tone="after" />
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
            {logs.map((l) => (
              <div key={`mob-${l.id}`} className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate">{l.actor ?? adminName.get(l.adminId) ?? `#${l.adminId}`}</div>
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{fmtDateTime(l.createdAt)}</div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-xl border shadow-sm ${actionStyle(l.action)}`}>
                      {ACTION_LABEL[l.action] ?? l.action}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-xl p-2 flex flex-col gap-1 shadow-sm">
                  <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-200/60 pb-1 mb-1">
                    {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : "Entity"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] font-bold text-neutral-400 shrink-0 w-8">BEFORE</span>
                      <Snapshot data={l.before} tone="before" />
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] font-bold text-neutral-400 shrink-0 w-8">AFTER</span>
                      <Snapshot data={l.after} tone="after" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider">Page <span className="text-neutral-900">{page}</span> of <span className="text-neutral-900">{totalPages}</span></span>
              <div className="flex gap-1">
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`flex items-center gap-1 text-[10px] font-black border border-neutral-200/60 shadow-sm px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${
                    page <= 1
                      ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50"
                      : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md hover:bg-white/80"
                  }`}
                >
                  Prev
                </Link>
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page + 1}`}
                  aria-disabled={page >= totalPages}
                  className={`flex items-center gap-1 text-[10px] font-black border border-neutral-200/60 shadow-sm px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${
                    page >= totalPages
                      ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50"
                      : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md hover:bg-white/80"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
