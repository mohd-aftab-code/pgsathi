import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Building2, Star, CreditCard, MessageSquare, Settings } from "lucide-react";

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
  
  console.log("[DEBUG] layout.tsx Session Check:", session);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  // Assuming role checks, but for now we allow any logged in user to see the dashboard 
  // (We'll upgrade them to OWNER when they list their first PG)

  const navItems = [
    { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
    { name: "My Listings", href: "/dashboard/owner/listings", icon: Building2 },
    { name: "Leads", href: "/dashboard/owner/leads", icon: MessageSquare },
    { name: "Reviews", href: "/dashboard/owner/reviews", icon: Star },
    { name: "Subscription", href: "/dashboard/owner/subscription", icon: CreditCard },
    { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen pt-8 pb-16">
      <div className="container-max section-padding">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3 p-3 mb-4 border-b border-neutral-100">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
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
                  // Extremely basic active state check
                  // const isActive = pathname === item.href; 
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
