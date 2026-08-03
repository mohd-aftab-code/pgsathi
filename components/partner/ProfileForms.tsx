"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

const inp =
  "w-full h-11 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none";
const lbl = "block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5";

function useSave(section: string) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function save(payload: any) {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, ...payload }),
      });
      const d = await res.json();
      if (!d.success) setError(d.message || "Save failed");
      else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch { setError("Something went wrong"); } finally { setSaving(false); }
  }
  return { save, saving, saved, error };
}

function SaveBtn({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold text-sm">
      {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : saved ? <><Check size={15} /> Saved</> : "Save"}
    </button>
  );
}

export function ProfileForm({ initial }: { initial: { name: string; company: string; city: string; address: string } }) {
  const [f, setF] = useState(initial);
  const { save, saving, saved, error } = useSave("profile");
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(f); }} className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Name</label><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className={lbl}>Company</label><input className={inp} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></div>
        <div><label className={lbl}>City</label><input className={inp} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
        <div><label className={lbl}>Address</label><input className={inp} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      </div>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

export function PayoutForm({ initial }: { initial: { panNumber: string; bankName: string; bankAccountNo: string; bankIfsc: string; upiId: string } }) {
  const [f, setF] = useState(initial);
  const { save, saving, saved, error } = useSave("payout");
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(f); }} className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>UPI ID</label><input className={inp} value={f.upiId} onChange={(e) => setF({ ...f, upiId: e.target.value })} placeholder="name@bank" /></div>
        <div><label className={lbl}>PAN Number</label><input className={inp} value={f.panNumber} onChange={(e) => setF({ ...f, panNumber: e.target.value })} placeholder="ABCDE1234F" /></div>
        <div><label className={lbl}>Bank Name</label><input className={inp} value={f.bankName} onChange={(e) => setF({ ...f, bankName: e.target.value })} /></div>
        <div><label className={lbl}>Account Number</label><input className={inp} value={f.bankAccountNo} onChange={(e) => setF({ ...f, bankAccountNo: e.target.value })} /></div>
        <div><label className={lbl}>IFSC</label><input className={inp} value={f.bankIfsc} onChange={(e) => setF({ ...f, bankIfsc: e.target.value })} placeholder="HDFC0001234" /></div>
      </div>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Payout will be sent to these details. Fill them correctly.</p>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

/**
 * These toggles are now actually read before anything is sent — see
 * lib/partner-notify. Until that existed they were stored and ignored, so
 * turning email off changed nothing.
 */
export function SettingsForm({
  initial,
  whatsappAvailable,
}: {
  initial: { notifyInApp: boolean; notifyEmail: boolean; notifyWhatsapp: boolean };
  /** False when no WhatsApp Business API is configured on the server. */
  whatsappAvailable: boolean;
}) {
  const [f, setF] = useState(initial);
  const { save, saving, saved, error } = useSave("settings");
  const toggle = (k: "notifyInApp" | "notifyEmail" | "notifyWhatsapp") => setF((s) => ({ ...s, [k]: !s[k] }));

  const rows: { k: "notifyInApp" | "notifyEmail" | "notifyWhatsapp"; label: string; desc: string; disabled?: boolean }[] = [
    { k: "notifyInApp", label: "In-app notifications", desc: "Portal ke andar alerts" },
    { k: "notifyEmail", label: "Email notifications", desc: "Nayi earning, approval aur payout ki email" },
    {
      k: "notifyWhatsapp",
      label: "WhatsApp notifications",
      desc: whatsappAvailable
        ? "Earning aur payout ke alerts WhatsApp par"
        : "Abhi available nahi — admin ne WhatsApp Business API configure nahi kiya",
      disabled: !whatsappAvailable,
    },
  ];

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(f); }} className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="space-y-2">
        {rows.map((r) => (
          <label
            key={r.k}
            className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 ${
              r.disabled ? "opacity-60" : "cursor-pointer"
            }`}
          >
            <div>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{r.label}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{r.desc}</div>
            </div>
            <button
              type="button"
              disabled={r.disabled}
              onClick={() => toggle(r.k)}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:cursor-not-allowed ${
                f[r.k] ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${f[r.k] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        ))}
      </div>



      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}
