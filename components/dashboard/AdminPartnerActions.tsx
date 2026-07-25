"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Ban, RotateCcw, Loader2 } from "lucide-react";

/** Approve / reject / suspend / reactivate buttons for one partner row. */
export function AdminPartnerActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function act(newStatus: string) {
    let reason: string | undefined;
    if (newStatus === "REJECTED") {
      reason = window.prompt("Reject reason (partner ko dikhega):") ?? undefined;
      if (reason === undefined) return;
    }
    setBusy(newStatus);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      const d = await res.json();
      if (!d.success) alert(d.message || "Action failed");
      else router.refresh();
    } catch {
      alert("Kuch gadbad ho gayi");
    } finally {
      setBusy("");
    }
  }

  const Btn = ({ s, label, Icon, cls }: { s: string; label: string; Icon: any; cls: string }) => (
    <button
      onClick={() => act(s)}
      disabled={!!busy}
      className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${cls}`}
    >
      {busy === s ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />} {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {status !== "APPROVED" && <Btn s="APPROVED" label="Approve" Icon={Check} cls="bg-green-50 text-green-700 hover:bg-green-100" />}
      {status === "PENDING" && <Btn s="REJECTED" label="Reject" Icon={X} cls="bg-red-50 text-red-600 hover:bg-red-100" />}
      {status === "APPROVED" && <Btn s="SUSPENDED" label="Suspend" Icon={Ban} cls="bg-amber-50 text-amber-700 hover:bg-amber-100" />}
      {status === "SUSPENDED" && <Btn s="APPROVED" label="Reactivate" Icon={RotateCcw} cls="bg-blue-50 text-blue-700 hover:bg-blue-100" />}
    </div>
  );
}
