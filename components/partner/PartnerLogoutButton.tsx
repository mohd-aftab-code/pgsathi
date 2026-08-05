"use client";

import { ReactNode } from "react";
import { signOut } from "next-auth/react";

export function PartnerLogoutButton({
  children,
  className,
  callbackUrl = "/",
}: {
  children: ReactNode;
  className?: string;
  callbackUrl?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl })}
    >
      {children}
    </button>
  );
}
