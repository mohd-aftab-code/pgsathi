"use client";
/**
 * /dashboard/admin/impersonate-session/page.tsx
 * This page is opened in a new tab after admin clicks "Login As".
 * It reads the JWT token from URL params, and uses it to create
 * a real NextAuth session for the target user.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

function ImpersonateSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying impersonation token...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!token || !email || !userId) {
      setStatus("error");
      setMessage("Missing required parameters.");
      return;
    }

    // Use NextAuth signIn with credentials — the special impersonate path
    // This triggers the authorize() in auth.ts with impersonateUserId
    // BUT we need the admin password for that path... 
    // Instead, use the token-based approach: call the verify API then redirect
    async function doImpersonate() {
      try {
        const res = await fetch("/api/admin/impersonate-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!data.success) {
          setStatus("error");
          setMessage(data.message || "Token verification failed.");
          return;
        }

        setMessage(`Signing in as ${data.userName}...`);

        // Now sign in using the special "impersonate" credentials
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
          setMessage(`Signed in as ${data.userName}! Redirecting...`);
          setTimeout(() => {
            router.push("/dashboard/owner");
          }, 1000);
        }
      } catch (err: any) {
        setStatus("error");
        setMessage("Network error: " + err.message);
      }
    }

    doImpersonate();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Impersonating User</h2>
            <p className="text-sm text-neutral-500">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Success!</h2>
            <p className="text-sm text-neutral-500">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Failed</h2>
            <p className="text-sm text-red-600">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-neutral-100 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-200 transition"
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
      <ImpersonateSessionInner />
    </SessionProvider>
  );
}
