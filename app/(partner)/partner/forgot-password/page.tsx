"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Handshake, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";

/**
 * Partner password reset — partner-branded UI on top of the SAME OTP endpoints
 * the rest of the app uses (/api/auth/forgot-password/*). Reusing them keeps
 * the OTP rate limits and verification logic in one hardened place instead of
 * creating a second, less-tested reset path.
 */
export default function PartnerForgotPasswordPage() {
  const [step, setStep] = useState<"PHONE" | "OTP" | "DONE">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (phone.length !== 10) return setError("10-digit phone number daalein");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await res.json();
      if (!d.success) {
        setError(d.message || "OTP nahi bhej paye");
        setLoading(false);
        return;
      }
      setInfo("OTP aapke phone par bhej diya gaya hai.");
      setStep("OTP");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length < 4) return setError("OTP daalein");
    if (newPassword.length < 8) return setError("Naya password kam se kam 8 characters ka ho");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const d = await res.json();
      if (!d.success) {
        setError(d.message || "OTP galat hai ya expire ho gaya");
        setLoading(false);
        return;
      }
      setStep("DONE");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full h-12 px-3 rounded-xl border border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all";

  return (
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
          {step === "DONE" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 grid place-items-center mx-auto mb-5">
                <CheckCircle2 className="text-green-400" size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">Password badal gaya</h1>
              <p className="text-sm text-neutral-400 mb-6">
                You can now login with your new password.
              </p>
              <Link
                href="/partner/login"
                className="block w-full h-12 leading-[3rem] rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/25 transition"
              >
                Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-1">Password reset</h1>
              <p className="text-sm text-neutral-400 mb-6">
                {step === "PHONE"
                  ? "Apna registered phone number daalein — OTP bhejenge."
                  : "Enter OTP and new password."}
              </p>

              {error && (
                <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              {info && step === "OTP" && (
                <div className="mb-5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5" /> {info}
                </div>
              )}

              {step === "PHONE" ? (
                <form onSubmit={sendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-700 bg-neutral-900/50 text-sm text-neutral-400">
                        +91
                      </span>
                      <input
                        type="tel" inputMode="numeric" maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Registered number"
                        className={`${inputCls} rounded-l-none`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold shadow-lg shadow-primary-500/25 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">OTP</label>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit OTP"
                      className={`${inputCls} tracking-[0.4em] text-center font-semibold`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">Naya Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kam se kam 8 characters"
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold shadow-lg shadow-primary-500/25 transition flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("PHONE"); setOtp(""); setError(""); }}
                    className="w-full text-sm text-neutral-400 hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft size={14} /> Number badlein
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-sm text-neutral-400 mt-6">
            <Link href="/partner/login" className="font-bold text-primary-400 hover:underline">
              Login page par wapas
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
