import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Search, Mail, Phone, ExternalLink, CalendarDays, CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export const metadata = {
  title: "Lead Inbox - Owner Dashboard",
};

export default async function LeadsInboxPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch leads for the owner's listings
  const leads = await db.lead.findMany({
    where: { listing: { ownerId: parseInt(session.user.id!) } },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Lead Inbox</h1>
          <p className="text-neutral-500 mt-1">Manage all inquiries and connect with potential tenants.</p>
        </div>
        
        {/* Simple Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-500">
                  <th className="py-5 px-6">Tenant Name</th>
                  <th className="py-5 px-6">Contact & Actions</th>
                  <th className="py-5 px-6">Property Interested</th>
                  <th className="py-5 px-6 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors group ${!lead.isRead ? 'bg-orange-50/30' : ''}`}>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${!lead.isRead ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-neutral-900 flex items-center gap-2">
                            {lead.name}
                            {!lead.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-semibold">{lead.source} Lead</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="font-bold text-neutral-800 tracking-wide">{lead.phone}</div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${lead.phone}`} 
                            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Phone size={12} /> Call
                          </a>
                          <a 
                            href={`https://wa.me/91${lead.phone}?text=Hi%20${lead.name},%20I%20am%20reaching%20out%20regarding%20your%20inquiry%20for%20${lead.listing.title}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1.5">
                        <Link href={`/pg/${lead.listing.slug}`} className="text-neutral-900 font-bold hover:text-primary-600 transition-colors flex items-center gap-1.5 line-clamp-1">
                          {lead.listing.title} <ExternalLink size={14} />
                        </Link>
                        {lead.message && (
                          <div className="text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 inline-block">
                            "{lead.message}"
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-neutral-900">
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                          <CalendarDays size={12} />
                          {format(new Date(lead.createdAt), 'dd MMM yyyy, h:mm a')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
              <Mail size={36} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Your Inbox is Empty</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-8 text-lg">
              You haven't received any leads yet. Make sure your listings have high-quality photos and competitive pricing.
            </p>
            <Link 
              href="/dashboard/owner/listings" 
              className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors inline-block"
            >
              Manage Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
