import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { redirect } from "next/navigation";
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      <div className="mb-6 pb-6 border-b border-neutral-100">
        <h1 className="text-2xl font-bold">{listing.title} - Inventory</h1>
        <p className="text-neutral-500 mt-1">Add rooms and click on beds to toggle occupancy in real-time.</p>
      </div>

      <InventoryManager listingId={listing.id} initialRooms={listing.rooms} />
    </div>
  );
}
