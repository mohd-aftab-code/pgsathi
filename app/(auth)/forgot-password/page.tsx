"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"PHONE" | "OTP" | "SUCCESS">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword }),
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
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Home size={24} color="white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">PGSathi</span>
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
          <Link href="/" className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Home size={20} color="white" />
            </div>
            <span className="font-extrabold text-xl text-primary-950">PGSathi</span>
          </Link>

          {step === "PHONE" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Forgot Password?
                </h2>
                <p className="text-neutral-500 text-sm">
                  Enter your registered phone number to receive a 6-digit OTP via SMS.
                </p>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">{error}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">+91</span>
                    <input type="tel" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                      className={`${inputCls} pl-12`} placeholder="Enter 10 digit number" required />
                  </div>
                </div>
                <button type="submit" disabled={loading || phone.length !== 10} className={btnCls}>
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
                <button onClick={() => setStep("PHONE")} className="text-sm font-bold text-primary-600 hover:underline mb-2 block">&larr; Back</button>
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Enter OTP & New Password
                </h2>
                <p className="text-neutral-500 text-sm">
                  We've sent an OTP to <span className="font-bold text-neutral-800">+91 {phone}</span>
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
