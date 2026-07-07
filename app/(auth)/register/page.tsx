"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Home,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Role = "TENANT" | "OWNER";

function RegisterContent() {
  const [role, setRole] = useState<Role>("TENANT");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your full name"); return; }
    if (phone.length !== 10) { setError("Please enter a valid 10-digit phone number"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters long"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Auto-login
        const loginRes = await signIn("credentials", {
          phone,
          password,
          redirect: false,
        });
        if (loginRes?.error) {
          window.location.href = "/login";
        } else {
          window.location.href =
            role === "OWNER" ? "/dashboard/owner" : "/dashboard";
        }
      } else {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const passwordStrength = (p: string) => {
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
    if (p.length < 12) return { label: "Good", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };
  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] bg-[#1e0a3c] relative overflow-hidden p-10 xl:p-14">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-16 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #ea580c, transparent)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Home size={22} color="white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            PGSathi
          </span>
        </Link>

        {/* Center */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Join 50,000+ users on PGSathi
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
            Your PG journey{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-orange-400">
              starts here.
            </span>
          </h1>

          <p className="text-violet-200/80 text-lg leading-relaxed mb-10 max-w-sm">
            Whether you're looking for a PG or managing one — we have everything
            you need.
          </p>

          {/* Benefits */}
          <div className="flex flex-col gap-3">
            {(role === "TENANT" ? [
              { emoji: "🔍", text: "Browse 10,000+ verified PG listings" },
              { emoji: "💬", text: "Connect directly via WhatsApp" },
              { emoji: "🏠", text: "Book site visits in one tap" },
            ] : [
              { emoji: "📋", text: "List unlimited PG properties" },
              { emoji: "📊", text: "Track rent, expenses & tenants" },
              { emoji: "🔔", text: "Get instant leads with zero commission" },
            ]).map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-sm font-medium text-white/80">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/30 font-medium">
          © 2026 PGSathi. Your data is safe with us. 🔒
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 sm:px-10 lg:px-16">
        {/* Mobile Logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Home size={18} color="white" />
          </div>
          <span className="font-extrabold text-xl text-neutral-900">PGSathi</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
              Create account ✨
            </h2>
            <p className="text-neutral-500 text-sm">
              Fill in the details below to get started for free.
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("TENANT")}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "TENANT"
                    ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {role === "TENANT" && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-3 right-3 text-violet-600"
                    fill="currentColor"
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "TENANT"
                      ? "bg-violet-600 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <User size={20} />
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-bold ${
                      role === "TENANT" ? "text-violet-700" : "text-neutral-700"
                    }`}
                  >
                    Tenant
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Looking for PG
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "OWNER"
                    ? "border-orange-500 bg-orange-50 shadow-md shadow-orange-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {role === "OWNER" && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-3 right-3 text-orange-500"
                    fill="currentColor"
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "OWNER"
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Building2 size={20} />
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-bold ${
                      role === "OWNER" ? "text-orange-600" : "text-neutral-700"
                    }`}
                  >
                    PG Owner
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Manage my PG
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm mb-5 font-medium animate-slide-down">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl text-sm mb-5 font-medium animate-slide-down">
              <CheckCircle2 size={18} />
              <span>Account created! Redirecting you...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                  placeholder="John Doe"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Phone size={15} className="text-neutral-400" />
                  <span className="text-neutral-500 text-sm font-semibold border-r border-neutral-300 pr-2.5">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 pl-24 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-neutral-400">Strength</span>
                    <span
                      className={`text-xs font-semibold ${
                        strength.label === "Strong"
                          ? "text-green-600"
                          : strength.label === "Good"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-12 pl-11 pr-12 bg-white border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm font-medium placeholder:text-neutral-400 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : confirmPassword && confirmPassword === password
                      ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
                      : "border-neutral-200 focus:border-violet-500 focus:ring-violet-500/10"
                  }`}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle2
                    size={16}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500"
                  />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full h-12 font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-2 ${
                role === "OWNER"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/25"
                  : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-violet-500/25"
              }`}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
              ) : (
                <><span>Create {role === "OWNER" ? "Owner" : ""} Account</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 font-bold hover:underline">
              Log in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-neutral-400 leading-relaxed">
            By registering, you agree to PGSathi&apos;s{" "}
            <Link href="/terms" className="underline hover:text-violet-600 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-violet-600 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-orange-500 rounded-2xl flex items-center justify-center">
              <Home size={20} color="white" />
            </div>
            <Loader2 size={24} className="animate-spin text-violet-600" />
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
