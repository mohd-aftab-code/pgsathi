/**
 * app/(main)/dashboard/manager/complaints/new/page.tsx
 * Log a new issue/complaint.
 */
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireManagerAccess, listingScope } from "@/lib/manager-auth";
import { db } from "@/lib/db";
import { LogComplaintForm } from "./LogComplaintForm";

export default async function NewComplaintPage() {
  const { userId, allowedListingIds } = await requireManagerAccess();

  // Fetch listings and active tenants to populate dropdowns
  const [listings, tenants] = await Promise.all([
    db.listing.findMany({
      where: { ownerId: userId, ...listingScope({ allowedListingIds }, "id") },
      select: { id: true, title: true },
    }),
    db.pgTenant.findMany({
      where: { ownerId: userId, status: "ACTIVE" },
      select: { id: true, name: true, phone: true, listingId: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/manager/complaints" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200/60 bg-white/60 backdrop-blur-md hover:bg-white/80 transition-colors">
          <ArrowLeft className="h-4 w-4 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Log Issue</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Nayi complaint ya issue log karein</p>
        </div>
      </div>
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6 max-w-lg mx-auto">
        <LogComplaintForm listings={listings} tenants={tenants} />
      </div>
    </div>
  );
}
