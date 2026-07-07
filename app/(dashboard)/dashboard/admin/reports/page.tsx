import { db } from "@/lib/db";
import { PieChart, TrendingUp, Users, Home } from "lucide-react";

export default async function AdminReportsPage() {
  const totalUsers = await db.user.count();
  const totalListings = await db.listing.count();
  const activeListings = await db.listing.count({ where: { status: "ACTIVE" } });
  
  const pgTypes = await db.listing.groupBy({
    by: ['pgType'],
    _count: true,
  });

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Analytics & Reports</h1>
        <p className="text-neutral-300 relative z-10">High-level platform metrics and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{totalUsers}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Total Users</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <Home size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{totalListings}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Total PGs</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900">{activeListings}</div>
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Active PGs</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PieChart size={20} className="text-primary-600"/> PGs by Type</h2>
        <div className="space-y-4">
          {pgTypes.map(type => (
            <div key={type.pgType} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="font-bold text-neutral-700">{type.pgType.replace('_', ' ')}</div>
              <div className="font-black text-primary-600 text-xl">{type._count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
