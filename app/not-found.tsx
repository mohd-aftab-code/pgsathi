import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-max section-padding">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-primary-700">404</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Page not found</h1>
        <p className="mt-2 text-neutral-500">
          Ye page exist nahi karta ya move ho chuka hai. Chalo aapko sahi jagah pahunchate hain.
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
