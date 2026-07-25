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
      className={`h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center ${
        entity === val ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={22} /> <h1 className="text-2xl font-extrabold">Audit Logs</h1>
        </div>
        <p className="text-neutral-300 text-sm">
          Har money aur partner action ka record — kisne, kab, kya se kya kiya. {total} entries.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tab("All", "")}
        {tab("Earnings", "PartnerEarning")}
        {tab("Payouts", "PartnerPayout")}
        {tab("Partners", "PartnerProfile")}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center text-neutral-500">
          Abhi koi audit entry nahi.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                  <th className="px-5 py-3 font-bold">When</th>
                  <th className="px-3 py-3 font-bold">Admin</th>
                  <th className="px-3 py-3 font-bold">Action</th>
                  <th className="px-3 py-3 font-bold">Entity</th>
                  <th className="px-5 py-3 font-bold">Before → After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-neutral-50 align-top">
                    <td className="px-5 py-3 text-neutral-500 whitespace-nowrap">{fmtDateTime(l.createdAt)}</td>
                    <td className="px-3 py-3 text-neutral-800">{l.actor ?? adminName.get(l.adminId) ?? `#${l.adminId}`}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${actionStyle(l.action)}`}>
                        {ACTION_LABEL[l.action] ?? l.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-neutral-600 whitespace-nowrap">
                      {l.entity ? `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        <Snapshot data={l.before} tone="before" />
                        <ArrowRight size={13} className="text-neutral-300 shrink-0 mt-0.5" />
                        <Snapshot data={l.after} tone="after" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`h-9 px-3 rounded-xl border border-neutral-200 text-sm font-semibold inline-flex items-center ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-neutral-50"}`}
                >
                  Previous
                </Link>
                <Link
                  href={`/dashboard/admin/audit-logs?${entity ? `entity=${entity}&` : ""}page=${page + 1}`}
                  aria-disabled={page >= totalPages}
                  className={`h-9 px-3 rounded-xl border border-neutral-200 text-sm font-semibold inline-flex items-center ${page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-neutral-50"}`}
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
