"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, IndianRupee, KeyRound, ShieldCheck, Copy, Check,
  UserPlus, Building2, ChevronRight, Phone
} from "lucide-react";

export type UnifiedOwner = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  plan: { name: string; amount: number; billingCycle: string; endDate: Date } | null;
  earnings: number;
  listings: {
    id: number;
    title: string;
    status: string;
    city: { name: string } | null;
    createdAt: Date;
  }[];
};

type Issued = { name: string; phone: string; password: string } | null;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const CYCLE_LABEL: Record<string, string> = {
  MONTHLY: "1 Month", QUARTERLY: "3 Month", HALF_YEARLY: "6 Month", YEARLY: "1 Year",
};

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  INACTIVE: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
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

export function UnifiedPgList({ owners }: { owners: UnifiedOwner[] }) {
  const [issued, setIssued] = useState<Issued>(null);

  async function resetPassword(o: UnifiedOwner) {
    if (!confirm(`Create new password for ${o.name}? The old one will stop working.`)) return;
    const d = await fetch(`/api/partner/owners/${o.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password" }),
    }).then((r) => r.json()).catch(() => null);
    if (d?.success) setIssued({ name: d.data.name, phone: d.data.phone, password: d.data.password });
    else alert(d?.message ?? "Reset failed");
  }

  if (owners.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center mx-auto mb-3">
          <Building2 className="text-neutral-400" size={22} />
        </div>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">
          Koi record nahi mila.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {owners.map((o) => (
        <div key={o.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          {/* Owner Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <UserPlus size={16} className="text-primary-500" />
                {o.name}
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Phone size={12} /> {o.phone ?? "—"}</span>
                <span>•</span>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  {o.listings.length} PG{o.listings.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-right">
              {o.plan ? (
                <div>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 inline-block">
                    {o.plan.name} · {CYCLE_LABEL[o.plan.billingCycle] ?? o.plan.billingCycle}
                  </div>
                  <div className="text-[10px] font-bold text-neutral-900 dark:text-white flex items-center justify-end gap-0.5 mt-1">
                    Earned: <IndianRupee size={10} className="text-neutral-400" /> {o.earnings.toLocaleString("en-IN")}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                  Active (Free Tier)
                </div>
              )}

              <button
                onClick={() => resetPassword(o)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                title="Reset Password"
              >
                <KeyRound size={12} /> Reset
              </button>
            </div>
          </div>

          {/* PGs List */}
          {o.listings.length > 0 ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {o.listings.map(l => (
                <Link
                  key={l.id}
                  href={`/partner/pgs/${l.id}`}
                  className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {l.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5"><MapPin size={10} /> {l.city?.name ?? "—"}</span>
                      <span className="flex items-center gap-0.5"><Calendar size={10} /> {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${statusStyle[l.status] ?? statusStyle.INACTIVE}`}>
                      {l.status}
                    </span>
                    <ChevronRight size={14} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center justify-between">
              <div>No PGs listed yet.</div>
              <Link href={`/partner/pgs/new?owner=${o.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors text-amber-800 dark:text-amber-200">
                <Building2 size={12} /> Add PG
              </Link>
            </div>
          )}
        </div>
      ))}

      {/* Credentials Modal */}
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
