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
        <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary-600" />
          Audit Log
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{total} actions recorded securely.</p>
      </div>

      {logs.length === 0 ? (
        <div className="card">
          <EmptyState icon={Activity} title="No activity yet" description="Aapke aur aapke staff ke actions yahan log honge." />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500 w-48">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500 w-32 hidden sm:table-cell">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-500 w-32 hidden md:table-cell">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-xs text-neutral-500">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-neutral-400 hidden sm:table-cell">{log.entity}</td>
                    <td className="px-4 py-3 text-xs text-neutral-600 hidden md:table-cell font-semibold">{log.actor}</td>
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
