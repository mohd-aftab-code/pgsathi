import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Users, PieChart, Settings } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";

export const metadata = {
  title: "Admin Dashboard - PGSathi",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/admin");
  }

  // Ensure user is an admin
  if (session.user?.role !== "ADMIN") {
    // For local development, if you want to bypass this check, comment it out.
    // redirect("/dashboard/owner");
  }

  const navItems = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Verify Listings", href: "/dashboard/admin/verify", icon: ShieldCheck },
    { name: "Plans", href: "/dashboard/admin/plans", icon: PieChart },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Reports", href: "/dashboard/admin/reports", icon: PieChart },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16">
      <div className="container-max section-padding">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white lg:rounded-2xl lg:p-4 shadow-sm border-b lg:border border-neutral-200 -mx-4 lg:mx-0 px-4 lg:px-0 pb-2 lg:pb-0">
              <div className="flex items-center gap-3 py-3 lg:p-3 mb-2 lg:mb-4 border-b border-neutral-100">
                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold shrink-0">
                  {session.user?.name?.charAt(0) || "A"}
                </div>
                <div>
                  <div className="font-bold text-sm line-clamp-1">{session.user?.name || "Admin User"}</div>
                  <div className="text-xs text-red-500 font-bold uppercase">Administrator</div>
                </div>
              </div>
              
              <nav className="flex overflow-x-auto lg:block lg:space-y-1 hide-scrollbar gap-2 lg:gap-0 pb-2 lg:pb-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-2 hidden lg:block">
                <LogoutButton />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
