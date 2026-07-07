import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Building2 } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import { OwnerSidebar } from "@/components/dashboard/OwnerSidebar";

export const metadata = {
  title: "Owner Dashboard - PGSathi",
};

export const dynamic = "force-dynamic";

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-max section-padding h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-neutral-900">PGSathi</span>
              <span className="text-neutral-400 text-xs ml-1">/ Owner</span>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-800 line-clamp-1 max-w-[150px]">
                {session.user.name || "Owner"}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
                {session.user.role || "OWNER"}
              </span>
            </div>
            <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "O"}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-6 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-16">
        
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <OwnerSidebar />

        {/* ── Main Content Area ──────────────────────────────── */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
