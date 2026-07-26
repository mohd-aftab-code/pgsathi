import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-max section-padding">
      <div className="max-w-md mx-auto text-center px-4">
        <h1 className="text-9xl font-black text-primary-100 dark:text-primary-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Page not found</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          This page doesn't exist or has been moved. Let's get you to the right place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home size={18} /> Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            <Search size={18} /> Search PGs
          </Link>
        </div>
      </div>
    </div>
  );
}
