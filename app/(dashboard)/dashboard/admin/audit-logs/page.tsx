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
  a.startsWith("payout") ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
  : a.includes("cancel") || a.includes("suspend") || a.includes("reject") ? "bg-rose-50 text-rose-700 border-rose-200/80"
  : a.includes("approve") || a.includes("paid") ? "bg-blue-50 text-blue-700 border-blue-200/80"
  : "bg-amber-50 text-amber-700 border-amber-200/80";

/** Renders a before/after JSON blob as short "key: value" chips. */
function Snapshot({ data, tone }: { data: any; tone: "before" | "after" }) {
  if (!data || typeof data !== "object") return <span className="text-slate-300">—</span>;
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return <span className="text-slate-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.slice(0, 4).map(([k, v]) => (
        <span
          key={k}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            tone === "before" ? "bg-slate-100 text-slate-700 border border-slate-200/60" : "bg-violet-50 text-violet-700 border border-violet-200/60"
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
      className={`h-8 px-3.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider transition-all ${
        entity === val
          ? "bg-slate-900 text-white shadow-xs"
          : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Audit Logs</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
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
        <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center text-slate-500 shadow-xs">
          Abhi koi audit entry nahi.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">When</th>
                    <th className="px-4 py-2.5 font-bold">Admin</th>
                    <th className="px-4 py-2.5 font-bold">Action</th>
                    <th className="px-4 py-2.5 font-bold">Entity</th>
                    <th className="px-4 py-2.5 font-bold">Before → After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 align-top transition-colors">
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider">{fmtDateTime(l.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-900 font-bold text-xs uppercase tracking-tight">{l.actor ?? adminName.get(l.adminId) ?? `#${l.adminId}`}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase border shadow-2xs ${actionStyle(l.action)}`}>
                          {ACTION_LABEL[l.action] ?? l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-bold text-xs">
                        {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1.5">
                          <Snapshot data={l.before} tone="before" />
                          <ArrowRight size={12} className="text-slate-400 shrink-0 mt-0.5" />
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
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {logs.map((l) => (
              <div key={`mob-${l.id}`} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm uppercase tracking-tight text-slate-900 truncate">{l.actor ?? adminName.get(l.adminId) ?? `#${l.adminId}`}</div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{fmtDateTime(l.createdAt)}</div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${actionStyle(l.action)}`}>
                      {ACTION_LABEL[l.action] ?? l.action}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-2.5 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60 pb-1">
                    {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : "Entity"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 w-12 uppercase">BEFORE</span>
                      <Snapshot data={l.before} tone="before" />
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 w-12 uppercase">AFTER</span>
                      <Snapshot data={l.after} tone="after" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span></span>
              <div className="flex gap-1.5">
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`flex items-center gap-1 text-xs font-bold border border-slate-200/80 shadow-2xs px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider ${
                    page <= 1
                      ? "opacity-40 pointer-events-none text-slate-400 bg-slate-50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50"
                  }`}
                >
                  Prev
                </Link>
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page + 1}`}
                  aria-disabled={page >= totalPages}
                  className={`flex items-center gap-1 text-xs font-bold border border-slate-200/80 shadow-2xs px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider ${
                    page >= totalPages
                      ? "opacity-40 pointer-events-none text-slate-400 bg-slate-50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50"
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
