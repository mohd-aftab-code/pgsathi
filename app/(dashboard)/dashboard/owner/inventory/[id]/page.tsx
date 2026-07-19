import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BedDouble } from "lucide-react";
import InventoryManager from "@/components/inventory/InventoryManager";

export const metadata = {
  title: "Manage Beds - PGSathi",
};

export default async function ManageInventoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listing = await prisma.listing.findUnique({
    where: {
      id: parseInt(params.id),
      ownerId: parseInt(session.user.id)
    },
    include: {
      rooms: {
        include: {
          beds: true
        }
      }
    }
  });

  if (!listing) {
    redirect("/dashboard/owner/inventory");
  }

  return (
    <div>
      <Link
        href="/dashboard/owner/inventory"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> All Properties
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <BedDouble className="text-primary-600" size={28} />
            {listing.title}
          </h1>
          <p className="text-neutral-500 mt-1">Add rooms and click on beds to toggle occupancy in real-time.</p>
        </div>
      </div>

      <InventoryManager listingId={listing.id} initialRooms={listing.rooms} />
    </div>
  );
}
