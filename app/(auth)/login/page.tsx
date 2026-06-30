"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, Lock } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginContent() {
  const searchParams = useSearchParams();
  let callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  if (callbackUrl.includes("/login")) callbackUrl = "/dashboard";

  // Tab: "user" (users) or "email" (admin)
  const [tab, setTab] = useState<"user" | "email">("user");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() =>
    searchParams?.get("error") === "CredentialsSignin" ? "Invalid credentials. Please try again." : ""
  );

  // User Login (Phone + Password)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) { setError("Please enter a valid 10-digit phone number"); return; }
    if (!password) { setError("Please enter your password"); return; }
    setLoading(true); setError("");
    try {
      const res = await signIn("credentials", { phone, password, redirect: false });
      if (res?.error) { setError("Invalid phone number or password."); setLoading(false); }
      else { window.location.href = callbackUrl; }
    } catch { setError("Failed to login."); setLoading(false); }
  };

  // Email + Password (Admin)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) { setError("Invalid email or password."); setLoading(false); }
      else {
        // Always redirect admin to admin dashboard
        window.location.href = "/dashboard/admin";
      }
    } catch { setError("Login failed."); setLoading(false); }
  };

  const inputCls = "w-full h-12 px-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all";
  const btnCls = "w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left - Branding */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-primary-950 text-white p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Home size={24} color="white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">PGSathi</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Welcome to India's most trusted PG platform.
          </h1>
          <p className="text-primary-200 text-lg">
            Manage your listings, connect with tenants directly via WhatsApp, and grow your PG business with zero commission.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <Link href="/" className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Home size={20} color="white" />
            </div>
            <span className="font-extrabold text-xl text-primary-950">PGSathi</span>
          </Link>

          {/* Tabs */}
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setTab("user"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${tab === "user" ? "bg-white shadow text-primary-700" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              User Login
            </button>
            <button
              onClick={() => { setTab("email"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${tab === "email" ? "bg-white shadow text-primary-700" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              <Lock size={13} /> Admin Login
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              {tab === "user" ? "Log in" : "Admin Login"}
            </h2>
            <p className="text-neutral-500 text-sm">
              {tab === "user"
                ? "Enter your phone number and password."
                : "Enter your admin email and password."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">{error}</div>
          )}

          {/* User Form */}
          {tab === "user" && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">+91</span>
                  <input type="tel" maxLength={10} value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    className={`${inputCls} pl-12`} placeholder="Enter 10 digit number" required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-neutral-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline font-medium">Forgot password?</Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? "Logging in..." : "Login"}
              </button>
              
              <div className="mt-6 text-center text-sm text-neutral-600">
                Don't have an account? <Link href="/register" className="text-primary-600 font-bold hover:underline">Register here</Link>
              </div>
            </form>
          )}

          {/* Email Form (Admin) */}
          {tab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="admin@pgsathi.in" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-neutral-400">
            By continuing, you agree to PGSathi's <br />
            <Link href="/terms" className="underline hover:text-primary-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
