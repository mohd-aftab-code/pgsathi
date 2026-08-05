"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff, Handshake, ArrowRight } from "lucide-react";

/**
 * Partner login — a separate page and entry point from the admin portal, as
 * required. It uses the same NextAuth credentials backend (one hardened auth
 * stack), but a session that is not a PARTNER is rejected here rather than
 * being let through to a partner URL.
 */
export default function PartnerLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (phone.length !== 10) return setError("10-digit phone number daalein");
    if (!password) return setError("Password daalein");

    setLoading(true);
    try {
      const res = await signIn("credentials", { phone, password, redirect: false });
      if (res?.error) {
        setError("Phone number ya password galat hai");
        setLoading(false);
        return;
      }

      // Confirm the account is actually a partner before sending them into the
      // portal — an owner/tenant must not land on partner URLs.
      const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
      if (session?.user?.role !== "PARTNER") {
        setError("This is not a partner account. For Owner/tenant login, please use the main login page.");
        setLoading(false);
        return;
      }

      window.location.href = "/partner/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    // Same dark shell as the admin portal login (bg-neutral-900 / card
    // bg-neutral-800), so the two staff-facing login screens read as one system.
    // Fixed dark rather than dark: variants — the admin page is dark in both
    // themes, and a half-dark partner page would not match it in light mode.
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-900">
      <div className="w-full max-w-md">
        <Link href="/partner" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-11 h-11 rounded-2xl bg-primary-500 grid place-items-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <Handshake className="text-white" size={22} />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-white leading-tight">PGSathi</div>
            <div className="text-[11px] font-bold text-primary-400 uppercase tracking-wider">Partner Portal</div>
          </div>
        </Link>

        <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 shadow-2xl p-7 sm:p-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-neutral-400 mb-6">
            Login to your partner account.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-700 bg-neutral-900/50 text-sm text-neutral-400">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  className="w-full h-12 px-3 rounded-r-xl border border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-300">Password</label>
                <Link href="/partner/forgot-password" className="text-xs font-semibold text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-12 px-3 pr-11 rounded-xl border border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 cursor-pointer"
              />
              Mujhe logged-in rakhein
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Logging in…</>
              ) : (
                <>Login <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400 mt-6">
            Partner account nahi hai?{" "}
            <Link href="/partner/signup" className="font-bold text-primary-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
