/**
 * app/(main)/dashboard/owner/manage/tenants/new/page.tsx
 * Add new tenant form — all fields with client-side form handling.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireManageAccess, logPgAudit } from "@/lib/manage-auth";
import { AddTenantForm } from "./AddTenantForm";

export const metadata = { title: "Add Tenant — PG Manager" };

export default async function AddTenantPage() {
  const { userId } = await requireManageAccess();

  const [listings, rooms] = await Promise.all([
    db.listing.findMany({
      where: { ownerId: userId },
      select: { id: true, title: true },
    }),
    db.room.findMany({
      where: { listingId: { in: [] } },  // loaded dynamically per listing
      select: { id: true, name: true, listingId: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/owner/manage/tenants" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition">
          <ArrowLeft className="h-4 w-4 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Add New Tenant</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Tenant ka poora profile banaiye</p>
        </div>
      </div>

      <AddTenantForm listings={listings} />
    </div>
  );
}
