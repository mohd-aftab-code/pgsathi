import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, MousePointerClick } from "lucide-react";

export const metadata = {
  title: "Analytics - Owner Dashboard",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // In a real app, we would fetch actual analytics data grouped by date
  // For now, we fetch aggregate stats for the UI
  const totalLeads = await db.lead.count({
    where: { listing: { ownerId: parseInt(session.user.id!) } },
  });

  const listingsCount = await db.listing.count({
    where: { ownerId: parseInt(session.user.id!) },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
        <p className="text-neutral-500">Track how your PG listings are performing.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <MousePointerClick size={18} className="text-blue-500" />
            Total Profile Views
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">0</div>
          <div className="text-xs text-neutral-400 mt-2">Last 30 days</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <Users size={18} className="text-green-500" />
            Total Leads Generated
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{totalLeads}</div>
          <div className="text-xs text-neutral-400 mt-2">All time</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <BarChart3 size={18} className="text-purple-500" />
            Conversion Rate
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">0%</div>
          <div className="text-xs text-neutral-400 mt-2">Views to Leads</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 text-neutral-500 mb-2 font-medium text-sm">
            <TrendingUp size={18} className="text-orange-500" />
            Active Listings
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{listingsCount}</div>
          <div className="text-xs text-neutral-400 mt-2">Currently published</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-6">Views Over Time (Last 30 Days)</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-100 rounded-xl bg-neutral-50">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-neutral-500 text-sm">Not enough data to display chart yet.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-6">Leads by Source</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-100 rounded-xl bg-neutral-50">
            <div className="text-center">
              <Users size={32} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-neutral-500 text-sm">Not enough data to display chart yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
