"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, PlusCircle, UserCircle2 } from "lucide-react";

export function MobileAppNav({ session }: { session?: any }) {
  const pathname = usePathname();

  // Hide global app nav inside the dashboard (dashboard has its own bottom nav).
  // Same for the partner section: the portal has its own bottom nav, and on the
  // public partner pages this bar was offering "List PG" and a general "Login" —
  // dropping someone who came to join as a partner into the owner/tenant funnel.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/partner")) return null;

  const isLoggedIn = !!session?.user;

  const tabs = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "List PG", href: "/dashboard/owner/listings/new", icon: PlusCircle },
    { 
      label: isLoggedIn ? (session.user.name?.split(" ")[0] || "Profile") : "Login", 
      href: isLoggedIn ? "/dashboard" : "/login", 
      icon: isLoggedIn ? User : UserCircle2,
      isProfile: true
    },
  ];

  return (
    <nav className="mobile-app-nav fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 z-[100] pb-[env(safe-area-inset-bottom)] items-center justify-around h-[72px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        // Exact match for Home to prevent highlighting on all routes
        const isActive = tab.href === "/" 
          ? pathname === "/" 
          : pathname.startsWith(tab.href);

        return (
          <Link 
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? "text-primary-700" : "text-neutral-400 active:text-neutral-600"
            }`}
          >
            {tab.isProfile && isLoggedIn ? (
              <div className={`relative flex items-center justify-center w-[30px] h-[30px] mb-0.5 rounded-full text-white font-bold text-xs shadow-sm transition-all ${
                isActive ? "bg-primary-600 ring-2 ring-primary-100 scale-110" : "bg-primary-500 scale-100"
              }`}>
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            ) : (
              <div className={`relative flex items-center justify-center p-1.5 rounded-2xl transition-all ${
                isActive ? "bg-primary-50 scale-110" : "bg-transparent scale-100"
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            )}
            <span className={`text-[11px] ${isActive ? "font-bold" : "font-medium"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
