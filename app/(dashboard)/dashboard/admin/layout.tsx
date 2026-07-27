import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/common/LogoutButton";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - PGSathi",
};

/**
 * The nav itself lives in AdminSidebar (a client component) because Lucide icons
 * are functions and cannot be passed across the Server→Client boundary. This file
 * stays a Server Component so the auth guard runs before anything renders.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/admin");
  }

  // ✅ SECURE: Only ADMIN role can access this dashboard
  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const name = session.user.name || "Admin User";
  const initial = name.charAt(0).toUpperCase();

  // Sits at the bottom of the desktop rail — identity + logout
  const footer = (
    <div className="rounded-xl bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-white grid place-items-center font-bold text-sm shrink-0 shadow-md">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          <p className="text-[10px] font-bold text-violet-200 uppercase tracking-wider flex items-center gap-1">
            <Shield size={9} />
            {session.user.role || "ADMIN"}
          </p>
        </div>
      </div>
      <LogoutButton className="w-full h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-red-300 bg-white/10 hover:bg-red-500/20 hover:text-red-200 border border-white/10 transition-colors cursor-pointer" />
    </div>
  );

  return (
    <AdminSidebar footer={footer}>
      <div className="min-h-screen bg-canvas">
        {/* Premium sticky top header — matches owner dashboard style */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_24px_rgba(109,40,217,0.06)]">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            {/* Left — page context */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile avatar (desktop has it in sidebar footer) */}
              <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white grid place-items-center font-bold text-sm shrink-0 shadow-md">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate lg:hidden">{name}</p>
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider lg:hidden">Super Admin</p>
                <p className="hidden lg:block text-sm font-semibold text-neutral-500">Admin Dashboard</p>
              </div>
            </div>

            {/* Right — user info + logout */}
            <div className="flex items-center gap-3">
              {/* Desktop-only user badge */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-800 line-clamp-1 max-w-[150px]">
                    {name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={9} />
                    Super Admin
                  </span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md ring-2 ring-violet-100">
                  {initial}
                </div>
              </div>
              <div className="w-px h-6 bg-neutral-200 hidden sm:block" />
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </AdminSidebar>
  );
}
