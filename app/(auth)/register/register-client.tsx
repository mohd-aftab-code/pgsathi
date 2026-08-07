"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo in vertical.png";
import { signIn } from "next-auth/react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Handshake,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Role = "TENANT" | "OWNER" | "PARTNER";

function RegisterContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [role, setRole] = useState<Role>("TENANT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // If there's a refCode, default to OWNER since partners refer owners
  useEffect(() => {
    if (refCode) setRole("OWNER");
  }, [refCode]);
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone, password, role, referralCode: refCode }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        if (role === "PARTNER") {
          // Partners require admin approval, don't auto login
          setTimeout(() => {
            window.location.href = "/login?partner_registered=true";
          }, 2000);
          return;
        }

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
      {role === "TENANT" ? (
        <AuthBrandPanel
          eyebrow="For Tenants"
          headline="Your next PG"
          accentWord="starts here."
          subtext="Browse verified listings, message owners directly, and book a visit — no broker in the middle."
          stats={[
            { value: "10,000+", label: "Verified listings" },
            { value: "12+", label: "Cities covered" },
            { value: "0%", label: "Brokerage" },
          ]}
          footer="© 2026 PGSathi. Your data stays private."
        />
      ) : role === "OWNER" ? (
        <AuthBrandPanel
          eyebrow="For PG Owners"
          headline="Fill your PG"
          accentWord="faster."
          subtext="List your property free, get leads straight on WhatsApp, and manage tenants & rent from one dashboard."
          stats={[
            { value: "10,000+", label: "PG owners onboard" },
            { value: "0%", label: "Commission on leads" },
            { value: "15 days", label: "Free CRM trial" },
          ]}
          footer="© 2026 PGSathi. Your data stays private."
        />
      ) : (
        <AuthBrandPanel
          eyebrow="For Partners"
          headline="Earn with"
          accentWord="PGSathi."
          subtext="Register PGs and earn on every paid conversion."
          stats={[
            { value: "₹500+", label: "Per Conversion" },
            { value: "Unlimited", label: "Earning Potential" },
            { value: "Transparent", label: "Payouts" },
          ]}
          footer="© 2026 PGSathi. Your data stays private."
        />
      )}

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-10 lg:px-16">
        {/* Mobile Logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2.5 mb-8 group"
        >
          <Image 
            src={logoImg} 
            alt="PGSathi Logo" 
            width={140}
            height={48}
            priority
            className="h-10 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
          />
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-6 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
              Create your account
            </h2>
            <p className="text-neutral-500 text-sm">
              Fill in the details below to get started for free.
            </p>
            {refCode && role === "OWNER" && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <Handshake size={14} /> Referred by Partner: {refCode}
              </div>
            )}
          </div>

          {/* Role Selector */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole("TENANT")}
                className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "TENANT"
                    ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {role === "TENANT" && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-violet-600"
                    fill="currentColor"
                  />
                )}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                    role === "TENANT"
                      ? "bg-violet-500 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <User size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      role === "TENANT" ? "text-violet-700" : "text-neutral-700"
                    }`}
                  >
                    Tenant
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Looking for PG
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "OWNER"
                    ? "border-orange-500 bg-orange-50 shadow-md shadow-orange-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {role === "OWNER" && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-orange-500"
                    fill="currentColor"
                  />
                )}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                    role === "OWNER"
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Building2 size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      role === "OWNER" ? "text-orange-600" : "text-neutral-700"
                    }`}
                  >
                    PG Owner
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Manage my PG
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("PARTNER")}
                className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  role === "PARTNER"
                    ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {role === "PARTNER" && (
                  <CheckCircle2
                    size={16}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-blue-500"
                    fill="currentColor"
                  />
                )}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                    role === "PARTNER"
                      ? "bg-blue-500 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Handshake size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      role === "PARTNER" ? "text-blue-600" : "text-neutral-700"
                    }`}
                  >
                    Partner
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Earn with us
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
                  className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                  placeholder="John Doe"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                  placeholder="you@example.com"
                  required
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
                  className="w-full h-11 sm:h-12 pl-24 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
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
                  className="w-full h-11 sm:h-12 pl-11 pr-12 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
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
                  className={`w-full h-11 sm:h-12 pl-11 pr-12 bg-white border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm font-medium placeholder:text-neutral-400 ${
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
              className={`w-full h-11 sm:h-12 font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-2 text-white text-sm sm:text-base ${
                role === "OWNER"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : role === "PARTNER"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-primary-500 hover:bg-primary-600"
              }`}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
              ) : (
                <><span>Create {role === "OWNER" ? "Owner" : role === "PARTNER" ? "Partner" : ""} Account</span><ArrowRight size={16} /></>
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
            <Image 
              src={logoImg} 
              alt="PGSathi Logo" 
              width={140}
              height={48}
              priority
              className="h-10 w-auto object-contain mix-blend-multiply" 
            />
            <Loader2 size={24} className="animate-spin text-violet-600" />
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
