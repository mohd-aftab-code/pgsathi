import { db } from "@/lib/db";
import { Users, Building2, ShieldAlert, BadgeIndianRupee } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const pendingListings = await db.listing.count({ where: { status: "PENDING" } });
  const activeListings = await db.listing.count({ where: { status: "ACTIVE" } });
  const totalUsers = await db.user.count();
  const owners = await db.user.count({ where: { role: "OWNER" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Overview</h1>
        <p className="text-neutral-500">Platform-wide statistics and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm relative z-10">
            <ShieldAlert size={18} className="text-orange-500" />
            Pending Approvals
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 relative z-10">{pendingListings}</div>
          <Link href="/dashboard/admin/listings" className="text-xs text-orange-600 font-bold mt-2 hover:underline inline-block relative z-10">
            Review Now &rarr;
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm relative z-10">
            <Building2 size={18} className="text-green-500" />
            Active PGs
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 relative z-10">{activeListings}</div>
          <div className="text-xs text-neutral-400 mt-2 relative z-10">Currently live</div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm relative z-10">
            <Users size={18} className="text-blue-500" />
            Total Users
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 relative z-10">{totalUsers}</div>
          <div className="text-xs text-neutral-400 mt-2 relative z-10">{owners} are Owners</div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100/50 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm relative z-10">
            <BadgeIndianRupee size={18} className="text-purple-500" />
            Revenue (Mtd)
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 relative z-10">₹0</div>
          <div className="text-xs text-neutral-400 mt-2 relative z-10">From Subscriptions</div>
        </div>
      </div>
    </div>
  );
}
