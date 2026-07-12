"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center container-max section-padding">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-error">!</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Kuch gadbad ho gayi</h1>
        <p className="mt-2 text-neutral-500">
          Ye page abhi load nahi ho paya. Ek baar retry kar dekhiye, ya home pe wapas jaiye.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary inline-flex items-center justify-center gap-2">
            <RefreshCcw size={18} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            <Home size={18} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
