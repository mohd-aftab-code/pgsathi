import { db } from "@/lib/db";
import { PieChart, TrendingUp, Users, Home } from "lucide-react";

export default async function AdminReportsPage() {
  const totalUsers = await db.user.count();
  const totalListings = await db.listing.count();
  const activeListings = await db.listing.count({ where: { status: "ACTIVE" } });
  
  // pgTypes query removed

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-extrabold mb-2 relative z-10 text-white">Analytics & Reports</h1>
        <p className="text-neutral-300 relative z-10">High-level platform metrics and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{totalUsers}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Total Users</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <Home size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{totalListings}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Total PGs</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{activeListings}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Active PGs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
