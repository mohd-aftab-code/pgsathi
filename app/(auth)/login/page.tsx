"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let callbackUrl = searchParams?.get("callbackUrl") || "/dashboard/owner";
  
  // Prevent infinite loops where callbackUrl points back to login
  if (callbackUrl.includes("/login")) {
    callbackUrl = "/dashboard/owner";
  }

  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("OTP");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Calling NextAuth React signIn directly. 
      // Using redirect: false prevents full page reload on error.
      const res = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid or expired OTP");
        setLoading(false);
      } else if (res?.url) {
        // Success! Force a full page navigation to clear client cache
        window.location.href = res.url;
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setError("Failed to verify OTP");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Branding */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-primary-950 text-white p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Home size={24} color="white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">PGSathi</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Welcome to India's most trusted PG platform.
          </h1>
          <p className="text-primary-200 text-lg">
            Manage your listings, connect with tenants directly via WhatsApp, and grow your PG business with zero commission.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <Link href="/" className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Home size={20} color="white" />
            </div>
            <span className="font-extrabold text-xl text-primary-950">PGSathi</span>
          </Link>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {step === "PHONE" ? "Log in or Sign up" : "Verify OTP"}
            </h2>
            <p className="text-neutral-500 text-sm">
              {step === "PHONE" 
                ? "Enter your phone number to receive a secure OTP." 
                : `We sent a 6-digit code to +91 ${phone}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">
              {error}
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Enter 10 digit number"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 px-4 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-center tracking-[0.5em] font-bold text-lg"
                  placeholder="------"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep("PHONE")}
                className="w-full h-12 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold rounded-xl transition-colors"
              >
                Change Phone Number
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
