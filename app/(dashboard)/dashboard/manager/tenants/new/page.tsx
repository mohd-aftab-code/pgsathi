/**
 * app/(main)/dashboard/manager/tenants/new/page.tsx
 * Add new tenant form — all fields with client-side form handling.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireManagerAccess, logPgAudit, listingScope } from "@/lib/manager-auth";
import { AddTenantForm } from "./AddTenantForm";

export const metadata = { title: "Add Tenant — PG Manager" };

export default async function AddTenantPage({ searchParams }: { searchParams: Promise<{ name?: string; phone?: string; email?: string }> }) {
  const { userId, allowedListingIds } = await requireManagerAccess();
  const sp = await searchParams;

  const listings = await db.listing.findMany({
    where: { ownerId: userId, ...listingScope({ allowedListingIds }, "id") },
    select: { id: true, title: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/manager/tenants" className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200/60 bg-white/60 backdrop-blur-md hover:bg-white/80 transition-colors">
          <ArrowLeft className="h-4 w-4 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Add New Tenant</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
            {sp.name ? `Pre-filled from Lead: ${sp.name}` : "Tenant ka poora profile banaiye"}
          </p>
        </div>
      </div>

      <AddTenantForm
        listings={listings}
        prefill={{ name: sp.name, phone: sp.phone, email: sp.email }}
      />
    </div>
  );
}
