import { db } from "@/lib/db";
import { Users, Building2, ShieldAlert, BadgeIndianRupee, TrendingUp, Activity, ArrowRight, CheckCircle2, FileBarChart } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdminDashboardPage() {
  const [pendingListings, activeListings, totalListings, totalUsers, activeSubscriptions, recentListings] = await Promise.all([
    db.listing.count({ where: { status: "PENDING" } }),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.listing.count(),
    db.user.count(),
    db.subscription.findMany({ where: { status: "ACTIVE" } }),
    db.listing.findMany({ 
      take: 5, 
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true } }, city: true }
    })
  ]);

  // Calculate real revenue from active subscriptions
  const totalRevenue = activeSubscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Super Admin Overview</h1>
          <p className="text-neutral-500 mt-1">Platform-wide statistics, revenue, and pending actions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
          <Activity size={16} className="text-green-500" />
          System Status: Healthy
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Pending Approvals Card - Highlighted */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 shadow-sm border border-red-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-200/50 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-red-100 text-red-600 p-3 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            {pendingListings > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="text-4xl font-black text-red-950 relative z-10 mb-1">{pendingListings}</div>
          <div className="text-sm font-bold text-red-800/70 mb-4 relative z-10">Pending Approvals</div>
          <Link href="/dashboard/admin/verify" className="flex items-center justify-between text-sm text-red-700 font-bold bg-white/60 hover:bg-white px-4 py-2 rounded-xl transition-colors relative z-10">
            Verify Now <ArrowRight size={16} />
          </Link>
        </div>

        {/* Active PGs */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-100/50 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-green-50 text-green-600 p-3 rounded-2xl">
              <Building2 size={24} />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="text-4xl font-black text-neutral-900 relative z-10 mb-1">{totalListings}</div>
          <div className="text-sm font-medium text-neutral-500 relative z-10">{activeListings} currently active PGs</div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <Users size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-neutral-900 relative z-10 mb-1">{totalUsers}</div>
          <div className="text-sm font-medium text-neutral-500 relative z-10">Total Registered Users</div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">
              <BadgeIndianRupee size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-neutral-900 relative z-10 mb-1">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-sm font-medium text-neutral-500 relative z-10">Revenue from {activeSubscriptions.length} Pro Owners</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Recently Added PGs</h2>
            <Link href="/dashboard/admin/verify" className="text-sm font-bold text-primary-600 hover:text-primary-700">Verify Pending</Link>
          </div>
          
          <div className="space-y-4">
            {recentListings.map(listing => (
              <div key={listing.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {listing.status === 'ACTIVE' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900">{listing.title}</h3>
                    <p className="text-sm font-medium text-neutral-500">by {listing.owner?.name} • <span className="text-primary-600">{listing.city?.name}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-1 uppercase tracking-wider ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                    {listing.status}
                  </div>
                  <div className="text-xs font-bold text-neutral-400 block">{formatDistanceToNow(listing.createdAt, { addSuffix: true })}</div>
                </div>
              </div>
            ))}
            {recentListings.length === 0 && (
              <div className="text-center py-8 text-neutral-500 font-medium">No listings yet.</div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-neutral-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-2xl font-bold mb-8 relative z-10">Quick Actions</h2>
          
          <div className="space-y-4 relative z-10 flex-1">
            <Link href="/dashboard/admin/users" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 px-5 rounded-2xl flex items-center gap-3 transition-colors">
              <Users size={20} className="text-blue-400" /> Manage Users
            </Link>
            <Link href="/dashboard/admin/verify" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 px-5 rounded-2xl flex items-center gap-3 transition-colors">
              <ShieldAlert size={20} className="text-red-400" /> Verify Listings
            </Link>
            <Link href="/dashboard/admin/reports" className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 px-5 rounded-2xl flex items-center gap-3 transition-colors">
              <FileBarChart size={20} className="text-purple-400" /> Financial Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
