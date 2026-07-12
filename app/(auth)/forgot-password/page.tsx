"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";
import { Home, ArrowRight, Lock, CheckCircle, Phone, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

type Mode = "PHONE" | "EMAIL";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("PHONE");
  const [step, setStep] = useState<"IDENTIFIER" | "OTP" | "SUCCESS">("IDENTIFIER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep("IDENTIFIER");
    setError("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "PHONE" && phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (mode === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "PHONE" ? "/api/auth/forgot-password/send-otp" : "/api/auth/forgot-password/send-otp-email";
      const body = mode === "PHONE" ? { phone } : { email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("OTP");
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "PHONE" ? "/api/auth/forgot-password/reset" : "/api/auth/forgot-password/reset-email";
      const body =
        mode === "PHONE" ? { phone, otp, newPassword } : { email, otp, newPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("SUCCESS");
      } else {
        setError(data.message || "Invalid OTP or failed to reset password.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-12 px-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all";
  const btnCls = "w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-primary-950 text-white p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <Image
              src={logoImg}
              alt="PGSathi Logo"
              width={160}
              height={56}
              priority
              className="h-14 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Securely reset your password.
          </h1>
          <p className="text-primary-200 text-lg">
            We use secure OTP verification to ensure that only you can access and recover your account.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 relative">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile Logo */}
          <Link href="/" className="flex md:hidden items-center gap-2 mb-8 justify-center group">
            <Image
              src={logoImg}
              alt="PGSathi Logo"
              width={140}
              height={48}
              priority
              className="h-10 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
            />
          </Link>

          {step === "IDENTIFIER" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Forgot Password?
                </h2>
                <p className="text-neutral-500 text-sm">
                  {mode === "PHONE"
                    ? "Enter your registered phone number to receive a 6-digit OTP via SMS."
                    : "Enter the email your account (Admin or Manager) logs in with — we'll send a 6-digit OTP there."}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-neutral-100 rounded-xl p-1 gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode("PHONE")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === "PHONE" ? "bg-white shadow-sm text-primary-700" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <Phone size={14} /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("EMAIL")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === "EMAIL" ? "bg-white shadow-sm text-primary-700" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <Mail size={14} /> Email (Admin/Manager)
                </button>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">{error}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                {mode === "PHONE" ? (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">+91</span>
                      <input type="tel" maxLength={10} value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                        className={`${inputCls} pl-12`} placeholder="Enter 10 digit number" required />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={inputCls} placeholder="you@example.com" required />
                  </div>
                )}
                <button type="submit" disabled={loading || (mode === "PHONE" ? phone.length !== 10 : !email)} className={btnCls}>
                  {loading ? "Sending OTP..." : "Send OTP"} <ArrowRight size={18} />
                </button>
                <div className="mt-6 text-center text-sm text-neutral-600">
                  Remember your password? <Link href="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
                </div>
              </form>
            </div>
          )}

          {step === "OTP" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <button onClick={() => setStep("IDENTIFIER")} className="text-sm font-bold text-primary-600 hover:underline mb-2 block">&larr; Back</button>
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Enter OTP & New Password
                </h2>
                <p className="text-neutral-500 text-sm">
                  We've sent an OTP to{" "}
                  <span className="font-bold text-neutral-800">
                    {mode === "PHONE" ? `+91 ${phone}` : email}
                  </span>
                </p>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">{error}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">6-Digit OTP</label>
                  <input type="text" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    className={`${inputCls} text-center tracking-[0.5em] font-bold text-lg`} placeholder="••••••" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className={inputCls} placeholder="At least 6 characters" required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className={inputCls} placeholder="Type password again" required minLength={6} />
                </div>
                <button type="submit" disabled={loading} className={btnCls}>
                  {loading ? "Resetting..." : "Reset Password"} <Lock size={18} />
                </button>
              </form>
            </div>
          )}

          {step === "SUCCESS" && (
            <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset Successful!</h2>
              <p className="text-neutral-500 mb-8">
                Your password has been updated securely. You can now log in with your new credentials.
              </p>
              <button
                onClick={() => router.push("/login")}
                className={btnCls}
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
