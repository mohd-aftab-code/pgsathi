/**
 * components/manage/ManageSidebarWrapper.tsx
 * Client wrapper that holds the sidebar open/close state.
 * The layout is a server component, so state lives here.
 */
"use client";
import { useState } from "react";
import { ManageSidebar } from "./ManageSidebar";

interface Props {
  ownerName: string;
  planTier: string;
  children: React.ReactNode;
}

export function ManageSidebarWrapper({ ownerName, planTier, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white">
        <ManageSidebar
          ownerName={ownerName}
          planTier={planTier}
          open={true}
          onClose={() => {}}
          onOpen={() => {}}
        />
      </div>

      {/* Mobile sidebar (overlay) */}
      <div className="lg:hidden">
        <ManageSidebar
          ownerName={ownerName}
          planTier={planTier}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
