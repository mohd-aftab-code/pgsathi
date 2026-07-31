/**
 * app/(auth)/change-password/page.tsx
 * Where `proxy.ts` parks an account whose password is still the one a partner
 * generated. Nothing else in the app is reachable until this is done.
 */
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < 6) { setError("Naya password kam se kam 6 characters ka ho"); return; }
    if (next !== confirm) { setError("Dono passwords match nahi kar rahe"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Password badal nahi paya"); return; }

      setDone(true);
      // Sign out rather than redirect.
      //
      // `proxy.ts` decides the redirect at the edge by decoding the session
      // cookie directly — it never runs the jwt callback, so the cookie still
      // carries mustChangePassword even though the database no longer does.
      // Navigating anywhere would simply bounce straight back here. Signing out
      // discards that stale cookie, and the next login mints a clean one.
      setTimeout(() => {
        signOut({ callbackUrl: "/login?passwordChanged=1" });
      }, 1400);
    } catch {
      setError("Kuch galat ho gaya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Password badal gaya</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Naye password se dobara login karein — aapko login page par le ja rahe hain…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Password badalna zaroori hai</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Aapka account kisi partner ne banaya tha, isliye aapka password unke paas bhi gaya tha.
            Aage badhne se pehle naya password set karein — tabhi account poori tarah aapka hoga.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field
              label="Purana password"
              value={current}
              onChange={setCurrent}
              show={show}
              placeholder="Jo partner ne diya tha"
            />
            <Field label="Naya password" value={next} onChange={setNext} show={show} placeholder="Kam se kam 6 characters" />
            <Field label="Naya password dobara" value={confirm} onChange={setConfirm} show={show} placeholder="Confirm karein" />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
              {show ? "Password chhupayein" : "Password dikhayein"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={17} />}
              {loading ? "Badal rahe hain…" : "Password set karein"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, show, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</label>
      <div className="relative">
        <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm font-medium outline-none focus:border-violet-400 focus:bg-white"
          required
        />
      </div>
    </div>
  );
}
