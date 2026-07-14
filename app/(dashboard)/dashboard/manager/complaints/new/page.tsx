/**
 * app/(main)/dashboard/manager/complaints/new/page.tsx
 * Log a new issue/complaint.
 */
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireManagerAccess } from "@/lib/manager-auth";
import { db } from "@/lib/db";
import { LogComplaintForm } from "./LogComplaintForm";

export default async function NewComplaintPage() {
  const { userId } = await requireManagerAccess();

  // Fetch listings and active tenants to populate dropdowns
  const [listings, tenants] = await Promise.all([
    db.listing.findMany({
      where: { ownerId: userId },
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
        <Link href="/dashboard/manager/complaints" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Log Issue</h1>
          <p className="text-sm text-neutral-500">Nayi complaint ya issue log karein</p>
        </div>
      </div>
      <div className="card p-6 max-w-lg mx-auto">
        <LogComplaintForm listings={listings} tenants={tenants} />
      </div>
    </div>
  );
}
