"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus, Loader2, Copy, Check, KeyRound, Building2, Search,
  ShieldCheck, X, Phone, Plus,
} from "lucide-react";

type Owner = {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  createdAt: string;
  pgCount: number;
  plan: { name: string; amount: number; billingCycle: string; endDate: string } | null;
};

/** Credentials are shown once, right after they're issued — there is no way to
 *  read a password back later, so the partner must copy it now. */
type Issued = { name: string; phone: string; password: string } | null;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const CYCLE_LABEL: Record<string, string> = {
  MONTHLY: "1 Month", QUARTERLY: "3 Month", HALF_YEARLY: "6 Month", YEARLY: "1 Year",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        });
      }}
      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
    >
      {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Copied" : label ?? "Copy"}
    </button>
  );
}

export function OwnerManager() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<Issued>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "" });

  async function load() {
    setLoading(true);
    try {
      const d = await fetch("/api/partner/owners").then((r) => r.json());
      if (d.success) setOwners(d.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const d = await fetch("/api/partner/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());
      if (!d.success) { setError(d.message || "Owner registration failed"); return; }
      setFormOpen(false);
      setForm({ name: "", phone: "", email: "", city: "" });
      if (d.data?.password) setIssued({ name: d.data.name, phone: d.data.phone, password: d.data.password });
      else alert(d.message);
      load();
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(o: Owner) {
    if (!confirm(`Create new password for ${o.name}? The old one will stop working.`)) return;
    const d = await fetch(`/api/partner/owners/${o.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password" }),
    }).then((r) => r.json()).catch(() => null);
    if (d?.success) setIssued({ name: d.data.name, phone: d.data.phone, password: d.data.password });
    else alert(d?.message ?? "Reset failed");
  }

  const filtered = owners.filter(
    (o) => !q || o.name.toLowerCase().includes(q.toLowerCase()) || (o.phone ?? "").includes(q),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">My Owners</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Register owners first, then list their PGs. Commission is earned on every payment made by the owner.
          </p>
        </div>
        <button
          onClick={() => { setFormOpen(true); setError(""); }}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 transition-colors"
        >
          <UserPlus size={16} /> New Owner
        </button>
      </div>

      {owners.length > 3 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full h-11 pl-9 pr-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white"
          />
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-16 text-neutral-400"><Loader2 className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <UserPlus className="mx-auto text-neutral-300 dark:text-neutral-600 mb-3" size={32} />
          <p className="font-bold text-neutral-700 dark:text-neutral-200">
            {owners.length === 0 ? "No owners yet" : "No match found"}
          </p>
          {owners.length === 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Start with "New Owner" — after that you can list their PGs.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 dark:text-white truncate">{o.name}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Phone size={12} /> {o.phone ?? "—"}</span>
                    <span className="inline-flex items-center gap-1"><Building2 size={12} /> {o.pgCount} PG</span>
                  </div>
                </div>
                {o.plan ? (
                  <div className="text-right">
                    <div className="text-xs font-bold px-2 py-1 rounded-lg bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 inline-block">
                      {o.plan.name} · {CYCLE_LABEL[o.plan.billingCycle] ?? o.plan.billingCycle}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">{inr(o.plan.amount)} paid</div>
                  </div>
                ) : o.pgCount === 0 ? (
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                    Action Needed: Add PG
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                    Active (Free Tier)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Link
                  href={`/partner/pgs/new?owner=${o.id}`}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                >
                  <Plus size={14} /> List their PG
                </Link>
                <button
                  onClick={() => resetPassword(o)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <KeyRound size={14} /> New password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Register form ─────────────────────────────────────────────── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !busy && setFormOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-neutral-900 dark:text-white">Register New Owner</h3>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={16} /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
              {[
                { k: "name", label: "Owner's full name", ph: "e.g. Ramesh Gupta", req: true },
                { k: "phone", label: "Phone number", ph: "10-digit", req: true },
                { k: "email", label: "Email (optional)", ph: "owner@example.com", req: false },
                { k: "city", label: "City (optional)", ph: "e.g. Allahabad", req: false },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">{f.label}</label>
                  <input
                    required={f.req}
                    value={(form as any)[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: f.k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value })}
                    placeholder={f.ph}
                    className="w-full h-11 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white"
                  />
                </div>
              ))}
              <p className="text-[11px] text-neutral-400">
                A password will be generated and shown on screen once — provide this to the owner.
              </p>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setFormOpen(false)} className="flex-1 h-11 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm text-neutral-700 dark:text-neutral-300">Cancel</button>
                <button type="submit" disabled={busy} className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5">
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Credentials, shown once ───────────────────────────────────── */}
      {issued && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl">
            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={18} />
              <h3 className="font-bold text-neutral-900 dark:text-white">{issued.name}'s login details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
                This password is shown <b>only once</b>. Copy it now and give it to the owner — it cannot be viewed later.
              </div>

              {[
                { label: "Phone (login ID)", value: issued.phone },
                { label: "Password", value: issued.password },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.label}</div>
                      <div className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white truncate">{row.value}</div>
                    </div>
                    <CopyButton text={row.value} />
                  </div>
                </div>
              ))}

              <CopyButton
                text={`PGSathi login\nPhone: ${issued.phone}\nPassword: ${issued.password}\n${typeof window !== "undefined" ? window.location.origin : "https://pgsathi.in"}/login`}
                label="Copy both together"
              />

              <button
                onClick={() => setIssued(null)}
                className="w-full h-11 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm"
              >
                Copied — Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
