"use client";

import { useState } from "react";
import { Ban, ShieldCheck, Trash2, UserCog, Loader2, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export function UserDetailActions({
  userId, userName, userRole, isActive,
}: {
  userId: number;
  userName: string;
  userRole: string;
  isActive: boolean;
}) {
  const [processing, setProcessing] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userRole);

  async function doAction(action: string, extra?: Record<string, any>) {
    if (!confirm(`Confirm: ${action} for "${userName}"?`)) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); window.location.reload(); }
      else toast.error(d.message || "Error");
    } catch {
      toast.error("Network error");
    } finally {
      setProcessing(false);
    }
  }

  async function impersonate() {
    if (!confirm(`Login as "${userName}"?`)) return;
    const toastId = toast.loading(`Setting up session...`);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = await res.json();
      if (d.success && d.token) {
        toast.success(`Opening ${userName}'s dashboard...`, { id: toastId });
        window.open(`/dashboard/admin/impersonate-session?token=${encodeURIComponent(d.token)}`, "_blank");
      } else {
        toast.error(d.message || "Failed", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    }
  }

  async function changeRole() {
    if (selectedRole === userRole) { toast("Role nahi badla."); return; }
    if (!confirm(`Change role from ${userRole} → ${selectedRole}?`)) return;
    setRoleChanging(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_role", userId, newRole: selectedRole }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); window.location.reload(); }
      else toast.error(d.message || "Error");
    } finally {
      setRoleChanging(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Impersonate */}
      <button
        onClick={impersonate}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-colors"
      >
        <LogIn size={13} /> Login As
      </button>

      {/* Role change */}
      <div className="flex items-center gap-1.5">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="text-xs font-semibold border border-neutral-200/60 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white/60 backdrop-blur-md text-neutral-700"
        >
          <option value="TENANT">TENANT</option>
          <option value="OWNER">OWNER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          onClick={changeRole}
          disabled={roleChanging || selectedRole === userRole}
          className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-violet-50 hover:bg-violet-100 disabled:opacity-50 text-violet-700 border border-violet-200 rounded-xl transition-colors"
        >
          {roleChanging ? <Loader2 size={12} className="animate-spin" /> : <UserCog size={12} />}
          Set
        </button>
      </div>

      {/* Ban/Unban */}
      <button
        onClick={() => doAction("ban")}
        disabled={processing}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
          isActive
            ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
        }`}
      >
        {processing ? <Loader2 size={12} className="animate-spin" /> : isActive ? <Ban size={12} /> : <ShieldCheck size={12} />}
        {isActive ? "Ban User" : "Unban"}
      </button>

      {/* Delete */}
      <button
        onClick={() => doAction("delete")}
        disabled={processing}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-neutral-50 hover:bg-red-50 text-neutral-600 hover:text-red-700 border border-neutral-200/60 hover:border-red-200 rounded-xl transition-colors"
      >
        {processing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        Delete
      </button>
    </div>
  );
}
