"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  const handleLogout = () => {
    // Use window.location.origin so the redirect always goes to the current
    // domain — whether localhost or production. Never hardcode a URL here.
    const homeUrl = typeof window !== "undefined" ? window.location.origin : "/";
    signOut({ callbackUrl: homeUrl });
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 cursor-pointer"}
      title="Log out"
      aria-label="Log out"
    >
      <LogOut size={18} />
    </button>
  );
}
