import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/common/LogoutButton";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

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
    <div className="rounded-xl bg-white border border-violet-100 p-3 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 grid place-items-center font-bold text-sm shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-900 truncate">{name}</p>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
            {session.user.role || "ADMIN"}
          </p>
        </div>
      </div>
      <LogoutButton className="w-full h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer" />
    </div>
  );

  return (
    <AdminSidebar footer={footer}>
      <div className="min-h-screen bg-canvas">
        {/* Mobile top bar — the desktop rail carries identity and logout, but on a
            phone the rail is gone, so they live here instead. */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-neutral-200">
          <div className="h-14 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center font-bold text-sm shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate leading-tight">{name}</p>
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Admin</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* pb-28 keeps the last row clear of the fixed mobile tab bar. */}
        <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </AdminSidebar>
  );
}
