"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoMark from "@/app/assets/logo/logo-icon.png";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

/**
 * Sign in.
 *
 * Deliberately a single narrow column with no illustration, no statistics and
 * no split panel. Those are what made the previous version read as generic:
 * every template reaches for the same brand-colour panel with three big numbers
 * in it, and swapping the artwork inside that layout does not change the fact
 * that it is the layout. Restraint is the thing that is hard to fake.
 *
 * The two account types are no longer a tab strip. Phone sign-in covers almost
 * everyone — tenants, owners and partners — so it is simply the page, and staff
 * reach their email form through one link. That removes a whole control from
 * the screen and makes the common path shorter.
 */

type Mode = "phone" | "staff";

const FIELD =
  "h-10 w-full rounded-[8px] border border-[#e4e4e7] bg-white px-3 text-[14px] text-[#18181b] outline-none transition-shadow " +
  "placeholder:text-[#a1a1aa] focus:border-[#8b5cf6] focus:ring-[3px] focus:ring-[#8b5cf6]/12";

const LABEL = "mb-1.5 block text-[13px] font-medium text-[#3f3f46]";

function LoginContent() {
  const searchParams = useSearchParams();
  let callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  if (callbackUrl.includes("/login")) callbackUrl = "/dashboard";

  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() =>
    searchParams?.get("error") === "CredentialsSignin"
      ? "Invalid credentials. Please try again."
      : ""
  );

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setShowPass(false);
  };

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
      const res = await signIn("credentials", { phone, password, redirect: false });
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

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerEmail || !managerPassword) {
      setError("Please enter your email and password");
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

  const notice =
    searchParams?.get("passwordChanged") === "1"
      ? "Password badal gaya. Naye password se sign in karein."
      : searchParams?.get("partner_registered") === "true"
        ? "Partner account ban gaya. Ab aap sign in kar sakte hain."
        : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px] rounded-[14px] border border-[#e7e7ea] bg-white p-8 shadow-[0_1px_2px_rgba(16,17,26,0.04),0_8px_24px_-12px_rgba(16,17,26,0.12)] sm:p-10">
          <Link href="/" className="mb-7 inline-block">
            <Image
              src={logoMark}
              alt="PGSathi"
              width={72}
              height={72}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#18181b]">
            {mode === "phone" ? "Sign in" : "Staff sign in"}
          </h1>
          <p className="mt-1.5 text-[14px] text-[#71717a]">
            {mode === "phone" ? (
              <>
                Naya account?{" "}
                <Link href="/register" className="font-medium text-[#7c3aed] hover:underline">
                  Register
                </Link>
              </>
            ) : (
              "Wo email jo aapke PG owner ne aapko di hai."
            )}
          </p>

          {/* A single line with a rule, not a filled alert box — it carries the
              same information at a fraction of the visual weight. */}
          {error && (
            <div className="mt-6 flex items-start gap-2 border-l-2 border-[#dc2626] pl-3 text-[13px] text-[#b91c1c]">
              <AlertCircle size={15} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!error && notice && (
            <div className="mt-6 flex items-start gap-2 border-l-2 border-[#16a34a] pl-3 text-[13px] text-[#15803d]">
              <CheckCircle2 size={15} className="mt-px shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {mode === "phone" ? (
            <form onSubmit={handleUserLogin} className="mt-7 space-y-4">
              <div>
                <label htmlFor="phone" className={LABEL}>
                  Phone number
                </label>
                <div className="relative">
                  {/* Static prefix, sized to match the field's own padding so the
                      digits line up with every other field on the page. */}
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#71717a]">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className={`${FIELD} pl-[46px]`}
                    placeholder="98765 43210"
                    required
                    autoFocus
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="password" className="text-[13px] font-medium text-[#3f3f46]">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[13px] text-[#71717a] hover:text-[#18181b]">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${FIELD} pr-10`}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#a1a1aa] transition-colors hover:text-[#18181b]"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <SubmitButton loading={loading} label="Continue" />
            </form>
          ) : (
            <form onSubmit={handleManagerLogin} className="mt-7 space-y-4">
              <div>
                <label htmlFor="mEmail" className={LABEL}>
                  Email
                </label>
                <input
                  id="mEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className={FIELD}
                  placeholder="manager@yourpg.in"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="mPassword" className={LABEL}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="mPassword"
                    type={showPass ? "text" : "password"}
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    className={`${FIELD} pr-10`}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#a1a1aa] transition-colors hover:text-[#18181b]"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <SubmitButton loading={loading} label="Continue" />

              <p className="text-[13px] text-[#71717a]">
                Password aapke PG owner ne set kiya hai. Bhool gaye hain to unse poochhein.
              </p>
            </form>
          )}

          {/* The other account type lives behind one link instead of a tab strip
              that every visitor has to read past. */}
          <div className="mt-7 border-t border-[#f4f4f5] pt-5">
            {mode === "phone" ? (
              <button
                onClick={() => switchMode("staff")}
                className="text-[13px] text-[#71717a] transition-colors hover:text-[#18181b]"
              >
                PG staff ho? <span className="font-medium text-[#3f3f46]">Email se sign in karein</span>
              </button>
            ) : (
              <button
                onClick={() => switchMode("phone")}
                className="inline-flex items-center gap-1.5 text-[13px] text-[#71717a] transition-colors hover:text-[#18181b]"
              >
                <ArrowLeft size={14} />
                Phone se sign in karein
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-[12px] text-[#a1a1aa]">
        <Link href="/terms" className="hover:text-[#71717a]">
          Terms
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-[#71717a]">
          Privacy
        </Link>
      </footer>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#7c3aed] text-[14px] font-medium text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {loading ? "Signing in…" : label}
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 size={20} className="animate-spin text-[#a1a1aa]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
