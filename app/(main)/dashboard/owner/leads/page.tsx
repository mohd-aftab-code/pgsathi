import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Search, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

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
          <h1 className="text-2xl font-bold text-neutral-900">Lead Inbox</h1>
          <p className="text-neutral-500">Manage all inquiries and connect with potential tenants.</p>
        </div>
        
        {/* Simple Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-sm text-neutral-500">
                  <th className="py-4 px-6 font-semibold">Tenant Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Info</th>
                  <th className="py-4 px-6 font-semibold">Property Interested</th>
                  <th className="py-4 px-6 font-semibold">Message</th>
                  <th className="py-4 px-6 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`border-b border-neutral-100 hover:bg-neutral-50 ${!lead.isRead ? 'bg-primary-50/50' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="font-bold text-neutral-900 flex items-center gap-2">
                        {lead.name}
                        {!lead.isRead && <span className="w-2 h-2 rounded-full bg-primary-600"></span>}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{lead.source} Lead</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-primary-600 font-medium hover:underline">
                          <Phone size={14} /> +91 {lead.phone}
                        </a>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 transition-colors">
                            <Mail size={14} /> {lead.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/pg/${lead.listing.slug}`} className="text-neutral-900 font-medium hover:text-primary-600 transition-colors flex items-center gap-1.5 line-clamp-1">
                        {lead.listing.title} <ExternalLink size={14} />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-neutral-600 max-w-[200px]">
                      <p className="line-clamp-2" title={lead.message || "No message provided"}>
                        {lead.message || <span className="text-neutral-400 italic">No message provided</span>}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right text-neutral-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Mail size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Inbox Empty</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              You haven't received any leads yet. Make sure your listings are active and consider boosting them to get more visibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
