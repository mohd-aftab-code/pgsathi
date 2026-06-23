import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { 
  Building2, PlusCircle, Eye, MessageSquare, 
  ArrowRight, Clock, Phone, MapPin
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function OwnerDashboardPage() {
  const session = await auth();
  const ownerId = parseInt(session?.user?.id || "0");
  
  // Fetch stats and recent leads
  const [listingsCount, leadsCount, recentLeads] = await Promise.all([
    db.listing.count({ where: { ownerId } }),
    db.lead.count({ where: { listing: { ownerId } } }),
    db.lead.findMany({
      where: { listing: { ownerId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        listing: { select: { title: true, slug: true } }
      }
    })
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-neutral-500 mt-1">Welcome back! Here is what's happening with your properties.</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/new" 
          className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add New PG
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500">Total Listings</h3>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Building2 size={24} />
            </div>
          </div>
          <p className="text-4xl font-black text-neutral-900 relative z-10">{listingsCount}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500">Total Views</h3>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Eye size={24} />
            </div>
          </div>
          <p className="text-4xl font-black text-neutral-900 relative z-10">0</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500">Total Leads</h3>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
              <MessageSquare size={24} />
            </div>
          </div>
          <p className="text-4xl font-black text-neutral-900 relative z-10">{leadsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Recent Leads</h2>
            <Link href="/dashboard/owner/leads" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="group relative flex items-start justify-between p-4 rounded-2xl border border-neutral-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all">
                {!lead.isRead && (
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-neutral-900 text-base">{lead.name}</h3>
                    {!lead.isRead && (
                      <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium mb-2">
                    <span className="flex items-center gap-1"><Phone size={14} className="text-primary-500"/> {lead.phone}</span>
                  </div>
                  <Link href={`/pg/${lead.listing.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors">
                    <MapPin size={14} /> {lead.listing.title}
                  </Link>
                </div>
                
                <div className="text-right flex flex-col items-end justify-between h-full">
                  <span className="flex items-center gap-1 text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md mb-3">
                    <Clock size={12} /> {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                  <a 
                    href={`https://wa.me/91${lead.phone}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}

            {recentLeads.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={24} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-medium">No leads yet. Ensure your property is featured to get more visibility!</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold mb-3 relative z-10">Maximize Occupancy</h3>
          <p className="text-primary-100 mb-8 text-sm leading-relaxed relative z-10">
            Complete your property profile with high-quality photos and accurate rules to increase your lead conversion rate by up to 3x.
          </p>
          <Link 
            href="/dashboard/owner/listings/new" 
            className="bg-white text-primary-900 hover:bg-primary-50 w-full text-center py-3.5 rounded-xl font-extrabold transition-all shadow-lg hover:shadow-xl relative z-10"
          >
            Add Another PG
          </Link>
        </div>
      </div>
    </div>
  );
}
