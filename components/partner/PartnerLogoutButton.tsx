"use client";

import { ReactNode } from "react";
import { signOut } from "next-auth/react";

export function PartnerLogoutButton({
  children,
  className,
  callbackUrl,
}: {
  children: ReactNode;
  className?: string;
  callbackUrl?: string;
}) {
  const handleLogout = () => {
    // Prevent redirect loop / error page by ensuring a fully qualified URL for callbackUrl
    const url = callbackUrl || (typeof window !== "undefined" ? window.location.origin : "/");
    signOut({ callbackUrl: url });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
    >
      {children}
    </button>
  );
}
