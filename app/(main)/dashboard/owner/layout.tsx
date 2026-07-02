import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Building2, Star, CreditCard, MessageSquare, Settings, Layers } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";

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

  const navItems = [
    { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
    { name: "My PGs", href: "/dashboard/owner/listings", icon: Building2 },
    { name: "Inventory", href: "/dashboard/owner/inventory", icon: Layers, hideMobile: true },
    { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
    { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star, hideMobile: true },
    { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen pt-4 lg:pt-8 pb-24 lg:pb-16">
      <div className="container-max section-padding">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar (Hidden on mobile) */}
          <aside className="hidden lg:block w-full lg:w-64 shrink-0">
            <div className="bg-white lg:rounded-2xl lg:p-4 shadow-sm border-b lg:border border-neutral-200">
              <div className="flex items-center gap-3 py-3 lg:p-3 mb-2 lg:mb-4 border-b border-neutral-100">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold shrink-0">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="font-bold text-sm line-clamp-1">{session.user?.name || "User"}</div>
                  <div className="text-xs text-neutral-500 capitalize">{session.user?.role?.toLowerCase()}</div>
                </div>
              </div>
              
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="mt-2">
                <LogoutButton />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.filter(item => !item.hideMobile).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full text-neutral-500 hover:text-primary-700 hover:bg-neutral-50 rounded-xl transition-colors gap-1"
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
