"use client";
/**
 * /dashboard/admin/impersonate-session/page.tsx
 * Opens in a new tab — verifies the impersonation JWT, creates a real
 * NextAuth session for the target user, then redirects to /dashboard/owner.
 */
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

function ImpersonateSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying impersonation token...");

  useEffect(() => {
    // We only need the token — it contains everything
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Missing token. Please try again from the Admin panel.");
      return;
    }

    async function doImpersonate() {
      try {
        // Step 1: Verify the token and get user info
        const res = await fetch("/api/admin/impersonate-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!data.success) {
          setStatus("error");
          setMessage(data.message || "Token verification failed. It may have expired (5 min limit).");
          return;
        }

        setMessage(`Signing in as ${data.userName}...`);

        // Step 2: Create a real NextAuth session using the token
        const result = await signIn("credentials", {
          email: data.email,
          password: "__IMPERSONATE__",
          impersonateToken: token,
          redirect: false,
        });

        if (result?.error) {
          setStatus("error");
          setMessage("Sign in failed: " + result.error);
        } else {
          setStatus("success");
          setMessage(`Signed in as ${data.userName}! Redirecting to their dashboard...`);
          setTimeout(() => {
            router.push("/dashboard/owner");
          }, 1200);
        }
      } catch (err: any) {
        setStatus("error");
        setMessage("Network error: " + err.message);
      }
    }

    doImpersonate();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-xl p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-14 h-14 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Setting up Impersonation</h2>
            <p className="text-sm text-neutral-500">{message}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-3">Please wait, this only takes a moment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Login Successful!</h2>
            <p className="text-sm text-neutral-500">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Failed</h2>
            <p className="text-sm text-red-600 mb-4">{message}</p>
            <button
              onClick={() => window.close()}
              className="w-full px-4 py-2.5 bg-neutral-100 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-200 transition"
            >
              Close Tab
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ImpersonateSessionPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ImpersonateSessionInner />
      </Suspense>
    </SessionProvider>
  );
}
