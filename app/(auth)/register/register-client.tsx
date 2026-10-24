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
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

type Role = "TENANT" | "OWNER" | "PARTNER";
type Step = "select" | "form";

// ── Role-selection card data ──────────────────────────────────────────────────
const ROLE_CARDS: {
  role: Role;
  label: string;
  sub: string;
  desc: string;
  Icon: React.ElementType;
  activeBg: string;
  activeBorder: string;
  activeShadow: string;
  activeText: string;
  iconActiveBg: string;
}[] = [
  {
    role: "OWNER",
    label: "PG Owner",
    sub: "List & manage property",
    desc: "List your PG for free, get direct WhatsApp leads, and manage tenants & rent from one dashboard.",
    Icon: Building2,
    activeBg: "bg-orange-50",
    activeBorder: "border-orange-500",
    activeShadow: "shadow-orange-100",
    activeText: "text-orange-700",
    iconActiveBg: "bg-orange-500",
  },
  {
    role: "TENANT",
    label: "Tenant",
    sub: "Find PG accommodation",
    desc: "Browse verified PG listings, contact owners directly, and book a visit — zero brokerage, always.",
    Icon: User,
    activeBg: "bg-violet-50",
    activeBorder: "border-violet-500",
    activeShadow: "shadow-violet-100",
    activeText: "text-violet-700",
    iconActiveBg: "bg-violet-500",
  },
  {
    role: "PARTNER",
    label: "Partner",
    sub: "Join Partner Program",
    desc: "Register PGs on behalf of owners and earn \u20b9500+ per paid conversion. Unlimited earning potential.",
    Icon: Handshake,
    activeBg: "bg-emerald-50",
    activeBorder: "border-emerald-500",
    activeShadow: "shadow-emerald-100",
    activeText: "text-emerald-700",
    iconActiveBg: "bg-emerald-500",
  },
];

// ── Role-Selection Screen ─────────────────────────────────────────────────────
function RoleSelectionScreen({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left brand panel (desktop only) */}
      <AuthBrandPanel
        eyebrow="Get Started Free"
        headline="Join thousands on"
        accentWord="PGSathi."
        subtext="Whether you're looking for a PG, listing your property, or joining our partner network — we have a place for you."
        stats={[
          { value: "100%", label: "Verified Listings" },
          { value: "Direct", label: "Owner Contact" },
          { value: "0%", label: "Brokerage, always" },
        ]}
        footer="© 2026 PGSathi. India's trusted zero-brokerage PG platform."
      />

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 sm:px-10 lg:px-16">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 group">
          <Image
            src={logoImg}
            alt="PGSathi Logo"
            width={180}
            height={64}
            priority
            className="h-14 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="w-full max-w-[480px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-neutral-500 text-sm">
              Choose how you want to join PGSathi.
            </p>
          </div>

          {/* Role cards */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {ROLE_CARDS.map(({ role, label, sub, desc, Icon, activeBg, activeBorder, activeShadow, activeText, iconActiveBg }) => (
              <button
                key={role}
                type="button"
                onClick={() => onSelect(role)}
                className="group relative w-full flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 bg-white text-left transition-all duration-150 cursor-pointer border-neutral-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20"
              >
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-100 text-neutral-500 transition-all group-hover:bg-violet-500 group-hover:text-white">
                  <Icon size={22} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-neutral-800 group-hover:text-violet-700 transition-colors">
                    {label}
                  </div>
                  <div className="text-xs font-semibold text-neutral-400 mb-1">{sub}</div>
                  <div className="text-sm text-neutral-500 leading-relaxed">{desc}</div>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={18}
                  className="shrink-0 mt-0.5 text-neutral-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ))}
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-neutral-500 mt-7">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 font-bold hover:underline">
              Sign In
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

// ── Registration Form ─────────────────────────────────────────────────────────
function RegisterContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [role, setRole] = useState<Role>("TENANT");

  // ── Step state: if a ?ref= code is present, skip role selection and go
  //    straight to the form (pre-selecting OWNER, matching existing logic).
  //    Otherwise, start at the role-selection screen.
  const [step, setStep] = useState<Step>(refCode ? "form" : "select");

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

  // Called from the role-selection screen when user picks a role
  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      const err = "Please enter your full name";
      setError(err);
      toast.error(err);
      return;
    }
    if (phone.length !== 10) {
      const err = "Please enter a valid 10-digit phone number";
      setError(err);
      toast.error(err);
      return;
    }
    if (password.length < 6) {
      const err = "Password must be at least 6 characters long";
      setError(err);
      toast.error(err);
      return;
    }
    if (password !== confirmPassword) {
      const err = "Passwords do not match";
      setError(err);
      toast.error(err);
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = "Please enter a valid email address";
      setError(err);
      toast.error(err);
      return;
    }

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
        toast.success("Account created successfully!");
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
        const err = data.message || "Registration failed. Please try again.";
        setError(err);
        toast.error(err);
        setLoading(false);
      }
    } catch {
      const err = "Something went wrong. Please try again.";
      setError(err);
      toast.error(err);
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

  // ── Step 1: Role selection ─────────────────────────────────────────────────
  if (step === "select") {
    return <RoleSelectionScreen onSelect={handleRoleSelect} />;
  }

  // ── Step 2: Registration form (existing, unmodified) ───────────────────────
  return (
    <div className="min-h-screen flex bg-neutral-50">
      {role === "TENANT" ? (
        <AuthBrandPanel
          eyebrow="For Tenants"
          headline="Your next PG"
          accentWord="starts here."
          subtext="Browse verified listings, message owners directly, and book a visit — no broker in the middle."
          stats={[
            { value: "100%", label: "Verified listings" },
            { value: "Direct", label: "Owner Contact" },
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
            { value: "Direct", label: "WhatsApp Leads" },
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
            { value: "\u20b9500+", label: "Per Conversion" },
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
            width={180}
            height={64}
            priority
            className="h-14 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Back button — only shown when not arriving via a ?ref= referral link */}
          {!refCode && (
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setError("");
              }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-600 font-semibold mb-5 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to role selection
            </button>
          )}

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

          {/* Selected role badge */}
          <div className="mb-5 sm:mb-6">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold ${
              role === 'OWNER'
                ? 'border-orange-300 bg-orange-50 text-orange-700'
                : role === 'PARTNER'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-violet-300 bg-violet-50 text-violet-700'
            }`}>
              {role === 'OWNER' && <Building2 size={15} />}
              {role === 'TENANT' && <User size={15} />}
              {role === 'PARTNER' && <Handshake size={15} />}
              <span>
                {role === 'OWNER' ? 'Registering as PG Owner' : role === 'PARTNER' ? 'Registering as Partner' : 'Registering as Tenant'}
              </span>
            </div>

            {role === 'PARTNER' && (
              <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
                <span>Looking for the dedicated Channel Partner onboarding with bank payouts?</span>
                <Link href="/partner/signup" className="font-bold underline shrink-0 hover:text-emerald-950">
                  Open Portal &rarr;
                </Link>
              </div>
            )}
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
              Sign In
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
              width={180}
              height={64}
              priority
              className="h-14 w-auto object-contain mix-blend-multiply"
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
