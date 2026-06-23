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
        <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-6 shadow-sm border border-primary-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Listings</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">{listingsCount}</p>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Views (30 days)</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Eye size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">0</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-600">Total Leads</h3>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-neutral-900">{leadsCount}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-3xl p-10 shadow-xl text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
          <span className="text-3xl">🚀</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Ready to grow?</h3>
        <p className="text-primary-100 mb-8 max-w-md mx-auto text-lg">
          Add your first PG listing to start receiving leads directly on your WhatsApp. It takes less than 2 minutes.
        </p>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-white text-primary-800 hover:bg-primary-50 px-8 py-3.5 rounded-xl font-extrabold transition-all inline-block shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Add Your First PG Now
        </Link>
      </div>
    </div>
  );
}
