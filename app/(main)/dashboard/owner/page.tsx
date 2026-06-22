import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Building2, PlusCircle, Eye, MessageSquare } from "lucide-react";

export default async function OwnerDashboardPage() {
  const session = await auth();
  
  // Fetch stats
  const listingsCount = await db.listing.count({
    where: { ownerId: parseInt(session?.user?.id || "0") },
  });
  
  const leadsCount = await db.lead.count({
    where: { listing: { ownerId: parseInt(session?.user?.id || "0") } },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-500">Welcome back, manage your PGs and track performance.</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Listings</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">{listingsCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Views (30 days)</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Eye size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">0</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Leads</h3>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">{leadsCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚀</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Ready to grow?</h3>
        <p className="text-neutral-500 mb-6 max-w-md mx-auto">
          Add your first PG listing to start receiving leads directly on your WhatsApp. It takes less than 2 minutes.
        </p>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block"
        >
          Add Your First PG
        </Link>
      </div>
    </div>
  );
}
