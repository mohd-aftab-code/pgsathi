/**
 * app/(main)/dashboard/manager/audit/page.tsx
 * PG Manager Audit Log
 */
import { ShieldAlert, Activity } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { EmptyState } from "@/components/manage/EmptyState";

export const metadata = { title: "Audit Log — PG Manager" };

function formatDateTime(d: Date) {
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

import { redirect } from "next/navigation";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const { userId, isOwner } = await requireManagerAccess();
  
  if (!isOwner) {
    redirect("/dashboard/manager");
  }

  const page  = parseInt(sp.page ?? "1");
  const limit = 50;

  const [logs, total] = await Promise.all([
    db.pgAuditLog.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.pgAuditLog.count({ where: { ownerId: userId } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-violet-600" />
          Audit Log
        </h1>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{total} actions recorded securely.</p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <EmptyState icon={Activity} title="No activity yet" description="Aapke aur aapke staff ke actions yahan log honge." />
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/40 border-b border-neutral-200/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500 w-48">Date & Time</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500">Action</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500 w-32 hidden sm:table-cell">Entity</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-neutral-500 w-32 hidden md:table-cell">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-xs font-black text-neutral-900">{log.action}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">{log.entity}</td>
                    <td className="px-4 py-3 text-[10px] font-black text-violet-700 uppercase tracking-wider hidden md:table-cell">{log.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
