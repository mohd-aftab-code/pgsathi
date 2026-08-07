"use client";

import { useState } from "react";
import { Loader2, Check, Upload, X } from "lucide-react";

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

function ImageUpload({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.success) onChange(d.url);
      else alert(d.message || "Upload failed");
    } catch {
      alert("Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={lbl}>{label}</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 h-32 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-xl h-32 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          <div className="w-10 h-10 bg-white/60 backdrop-blur-md dark:bg-neutral-800 rounded-full grid place-items-center shadow-sm mb-2 text-primary-500">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          </div>
          <p className="font-bold text-[11px] text-neutral-900 dark:text-white">{uploading ? "Uploading…" : "Upload Image"}</p>
        </label>
      )}
    </div>
  );
}

export function KycForm({ initial }: { initial: { aadhaarNumber: string; panImage: string | null; aadhaarFrontImage: string | null; aadhaarBackImage: string | null } }) {
  const [f, setF] = useState(initial);
  const { save, saving, saved, error } = useSave("kyc");
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(f); }} className="space-y-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Aadhaar Number</label>
          <input className={inp} value={f.aadhaarNumber} onChange={(e) => setF({ ...f, aadhaarNumber: e.target.value })} placeholder="1234 5678 9012" />
        </div>
        <div className="hidden sm:block"></div>
        <ImageUpload label="PAN Card Image" value={f.panImage} onChange={(v) => setF({ ...f, panImage: v })} />
        <div className="hidden sm:block"></div>
        <ImageUpload label="Aadhaar Front Image" value={f.aadhaarFrontImage} onChange={(v) => setF({ ...f, aadhaarFrontImage: v })} />
        <ImageUpload label="Aadhaar Back Image" value={f.aadhaarBackImage} onChange={(v) => setF({ ...f, aadhaarBackImage: v })} />
      </div>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Upload clear images of your documents for faster verification.</p>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}
