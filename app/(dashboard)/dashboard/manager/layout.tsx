import { auth } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/common/LogoutButton";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";
import { requireManagerAccess } from "@/lib/manager-auth";
import { ManagerSidebar } from "@/components/dashboard/ManagerSidebar";

export const metadata = {
  title: "CRM Workspace — PGSathi",
};

export const dynamic = "force-dynamic";

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { name, managerRole, isOwner } = await requireManagerAccess();

  const roleColors: Record<string, string> = {
    MANAGER:    "bg-violet-100 text-violet-700",
    WARDEN:     "bg-blue-100 text-blue-700",
    ACCOUNTANT: "bg-green-100 text-green-700",
    OWNER:      "bg-amber-100 text-amber-700"
  };
  const roleBadgeCls = roleColors[managerRole] ?? "bg-neutral-100 text-neutral-600";

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-40 shadow-sm">
        <div className="container-max section-padding h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image 
              src={logoImg} 
              alt="PGSathi Logo" 
              width={100}
              height={36}
              priority
              className="h-8 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-neutral-400 text-xs font-medium">/ Workspace</span>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-neutral-800 line-clamp-1 max-w-[150px]">
                  {name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${roleBadgeCls}`}>
                  {managerRole}
                </span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                {name?.charAt(0).toUpperCase() || "M"}
              </div>
            </div>
            <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-6 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-16">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <ManagerSidebar isOwner={isOwner} />

        {/* ── Main Content Area ──────────────────────────────── */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
