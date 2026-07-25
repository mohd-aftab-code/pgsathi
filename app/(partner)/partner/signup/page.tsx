"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Handshake, CheckCircle2, ArrowRight } from "lucide-react";

const TYPES = [
  { value: "FREELANCER", label: "Freelancer" },
  { value: "CHANNEL_PARTNER", label: "Channel Partner" },
  { value: "MARKETING_EXECUTIVE", label: "Marketing Executive" },
  { value: "SALES_EXECUTIVE", label: "Sales Executive" },
  { value: "SUB_BROKER", label: "Sub Broker" },
];

export default function PartnerSignupPage() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", city: "", company: "", type: "FREELANCER",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ partnerCode: string } | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Poora naam daalein");
    if (form.phone.length !== 10) return setError("10-digit phone number daalein");
    if (form.password.length < 8) return setError("Password kam se kam 8 characters ka ho");

    setLoading(true);
    try {
      const res = await fetch("/api/partner/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) {
        setError(d.message || "Registration nahi ho paya");
        setLoading(false);
        return;
      }
      setDone({ partnerCode: d.partnerCode });
    } catch {
      setError("Kuch gadbad ho gayi. Dobara try karein.");
      setLoading(false);
    }
  }

  // ── success: application submitted, awaiting admin approval ──────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 via-white to-violet-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 grid place-items-center mx-auto mb-5">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">Application submitted</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Aapka partner account ban gaya hai. Admin approval ke baad aap login kar payenge —
            usually 24 ghante ke andar.
          </p>
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-3 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Aapka Partner Code
            </div>
            <div className="text-xl font-extrabold tracking-widest text-primary-600 dark:text-primary-400">
              {done.partnerCode}
            </div>
          </div>
          <Link
            href="/partner/login"
            className="block w-full h-12 leading-[3rem] rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/25 transition"
          >
            Login page par jaayein
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full h-12 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 via-white to-violet-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-lg">
        <Link href="/partner" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-11 h-11 rounded-2xl bg-primary-500 grid place-items-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <Handshake className="text-white" size={22} />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-neutral-900 dark:text-white leading-tight">PGSathi</div>
            <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Partner Portal</div>
          </div>
        </Link>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-7 sm:p-8">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-1">Partner banein</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            PG register karein aur har paid conversion par earning paayein.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Poora Naam *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rahul Sharma" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Phone *</label>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                className={inputCls}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Aap kaun hain? *</label>
              <select className={`${inputCls} cursor-pointer`} value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">City</label>
              <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Jaipur" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Company <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Agency / firm ka naam" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className={`${inputCls} pr-11`}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Kam se kam 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : <>Register karein <ArrowRight size={17} /></>}
              </button>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-3">
                Registration ke baad admin approval zaroori hai.
              </p>
            </div>
          </form>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            Pehle se account hai?{" "}
            <Link href="/partner/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
