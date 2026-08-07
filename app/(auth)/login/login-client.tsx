"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo in vertical.png";
import { signIn } from "next-auth/react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";

type Tab = "user" | "manager";

function LoginContent() {
  const searchParams = useSearchParams();
  let callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  if (callbackUrl.includes("/login")) callbackUrl = "/dashboard";

  const [tab, setTab] = useState<Tab>("user");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showManagerPass, setShowManagerPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() =>
    searchParams?.get("error") === "CredentialsSignin"
      ? "Invalid credentials. Please try again."
      : ""
  );

  const resetError = () => setError("");

  // ── Tab 1: User (Phone + Password) ──────────────────────────────
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid phone number or password. Please try again.");
        setLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ── Tab 2: Manager Login (Email from PgTeamMember) ───────────────
  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerEmail || !managerPassword) {
      setError("Please enter your manager email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/manager-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: managerEmail, password: managerPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid manager credentials.");
        setLoading(false);
        return;
      }
      // Sign in using next-auth with manager token
      const signInRes = await signIn("credentials", {
        email: managerEmail,
        password: managerPassword,
        isManager: "true",
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Manager login failed. Please try again.");
        setLoading(false);
      } else {
        window.location.href = "/dashboard/manager";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "user", label: "Tenant / Owner / Partner", icon: User, desc: "Login with phone number" },
    { id: "manager", label: "Manager / Staff", icon: Building2, desc: "PG staff sub-login" },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <AuthBrandPanel
        eyebrow="For Tenants, Owners & Managers"
        headline="Manage your PG"
        accentWord="the simple way."
        subtext="List properties, track tenants, and collect rent — everything in one place, zero brokerage."
        stats={[
          { value: "10,000+", label: "PG Listings" },
          { value: "50,000+", label: "Users on PGSathi" },
          { value: "0%", label: "Brokerage, always" },
        ]}
        footer="© 2026 PGSathi. Trusted by 10,000+ PG owners."
      />

      {/* ── Right Panel (Form) ───────────────────────────────────── */}
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
          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-neutral-500 text-sm">
              Sign in to your PGSathi account to continue.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1 mb-7">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    resetError();
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-white shadow-md text-violet-700 shadow-violet-100"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:block">{t.label}</span>
                  <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Tab description */}
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 mb-6">
            {tab === "user" && <User size={14} className="text-violet-600 shrink-0" />}
            {tab === "manager" && <Building2 size={14} className="text-violet-600 shrink-0" />}
            <p className="text-xs text-violet-700 font-medium">
              {tab === "user" && "For tenants, PG owners, and partners. Login with your registered phone number."}
              {tab === "manager" && "For PG staff. Use your manager email provided by your PG owner."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-sm mb-5 font-medium animate-slide-down">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Partner Registration Success */}
          {searchParams?.get("partner_registered") === "true" && !error && (
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 p-3.5 rounded-xl text-sm mb-5 font-medium animate-slide-down">
              <span className="text-lg leading-none mt-0.5">🎉</span>
              <span>Partner account created successfully! You can now log in.</span>
            </div>
          )}

          {/* ══ FORM: User Login ══════════════════════════════════ */}
          {tab === "user" && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone size={15} className="text-neutral-400" />
                    <span className="text-neutral-500 text-sm font-semibold border-r border-neutral-300 pr-2.5">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-12 pl-24 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                    placeholder="Enter 10-digit number"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-violet-600 hover:text-violet-700 font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <><span>Sign In</span><ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-violet-600 font-bold hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          )}

          {/* ══ FORM: Manager Login ════════════════════════════════ */}
          {tab === "manager" && (
            <form onSubmit={handleManagerLogin} className="space-y-4">
              {/* Manager Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Manager Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                    placeholder="manager@yourpg.in"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Manager Password */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showManagerPass ? "text" : "password"}
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 bg-white border-2 border-neutral-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm font-medium placeholder:text-neutral-400"
                    placeholder="Enter your manager password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowManagerPass(!showManagerPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showManagerPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Manager Role Badge */}
              <div className="flex gap-2 flex-wrap">
                {["MANAGER", "WARDEN", "ACCOUNTANT"].map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Building2 size={10} />
                    {role}
                  </span>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <><Building2 size={16} /><span>Sign In as Manager</span></>
                )}
              </button>

              <p className="text-center text-xs text-neutral-400">
                Your login credentials are provided by your PG Owner.
                <br />
                Contact your owner if you&apos;ve forgotten your password.
              </p>
            </form>
          )}



          {/* Footer */}
          <p className="mt-8 text-center text-xs text-neutral-400 leading-relaxed">
            By continuing, you agree to PGSathi&apos;s{" "}
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

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
