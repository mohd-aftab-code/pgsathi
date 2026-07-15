/**
 * app/(dashboard)/dashboard/manager/enquiries/page.tsx
 * Real leads/enquiries from the database — CRM style with WhatsApp + Convert to Tenant actions.
 */
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { Mail, Phone, MessageCircle, CalendarDays, UserPlus, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { MarkLeadReadBtn } from "@/components/manage/MarkLeadReadBtn";

export const metadata = { title: "Enquiries — PG Manager" };

export default async function EnquiriesPage() {
  const { userId } = await requireManagerAccess();
  const sanitizePhone = (p: string) => p.replace(/\D/g, '').replace(/^(91)/, '');

  // Fetch all leads (from tenant enquiry forms on pgsathi.in)
  const leads = await db.lead.findMany({
    where: { listing: { ownerId: userId } },
    include: { listing: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Fetch scheduled visits
  const visits = await db.visitBooking.findMany({
    where: { listing: { ownerId: userId } },
    include: { listing: { select: { id: true, title: true } } },
    orderBy: { visitDate: "asc" },
    take: 50,
  });

  const pending  = leads.filter(l => !l.isRead);
  const totalAll = leads.length + visits.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <UserPlus className="text-violet-600" size={22} /> Enquiries & Leads
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {totalAll} total · <span className="font-semibold text-orange-600">{pending.length} unread</span>
          </p>
        </div>
      </div>

      {/* Upcoming Visits */}
      {visits.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={14} /> Scheduled Visits ({visits.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visits.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-neutral-900">{v.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${
                    v.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"
                  }`}>{v.status}</span>
                </div>
                <div className="space-y-1.5 text-sm text-neutral-600 mb-3">
                  <p className="flex items-center gap-2"><Phone size={13} className="text-neutral-400" /> {v.phone}</p>
                  <p className="flex items-center gap-2 font-semibold text-violet-700">
                    <CalendarDays size={13} /> {format(new Date(v.visitDate), "dd MMM yyyy, h:mm a")}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{v.listing.title}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-neutral-100">
                  <a href={`tel:${v.phone}`} className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/91${sanitizePhone(v.phone)}?text=Hi%20${encodeURIComponent(v.name)}%2C%20confirming%20your%20visit%20at%20${encodeURIComponent(format(new Date(v.visitDate), "h:mm a, dd MMM"))}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                  <Link
                    href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(v.name)}&phone=${encodeURIComponent(v.phone)}`}
                    className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                  >
                    ➜ Tenant
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leads Table */}
      <section>
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Mail size={14} /> General Enquiries ({leads.length})
        </h2>

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Mail size={36} className="mx-auto text-neutral-300 mb-3" />
            <h3 className="font-bold text-neutral-700 mb-1">No Enquiries Yet</h3>
            <p className="text-sm text-neutral-500">Leads from pgsathi.in will appear here automatically.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto pb-8 md:px-1 md:-mx-1">
              <>
                <table className="w-full text-sm hidden md:table">
                  <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-200">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Name</th>
                      <th className="px-5 py-3 text-left font-semibold">Contact</th>
                      <th className="px-5 py-3 text-left font-semibold">Property</th>
                      <th className="px-5 py-3 text-left font-semibold">Received</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {leads.map(lead => (
                      <tr key={lead.id} className={`hover:bg-neutral-50/50 transition-colors ${!lead.isRead ? "bg-orange-50/30" : ""}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${!lead.isRead ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-600"}`}>
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                {lead.name}
                                {!lead.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />}
                              </p>
                              <p className="text-xs text-neutral-400 uppercase">{lead.source} Lead</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-neutral-800">{lead.phone}</p>
                          {lead.message && <p className="text-xs text-neutral-500 italic mt-0.5 max-w-[200px] truncate">"{lead.message}"</p>}
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/pg/${lead.listing.slug}`} target="_blank" className="text-violet-600 hover:underline font-medium flex items-center gap-1 text-xs">
                            <ExternalLink size={11} /> {lead.listing.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500">
                          <p className="font-medium">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</p>
                          <p className="text-neutral-400">{format(new Date(lead.createdAt), "dd MMM, h:mm a")}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`tel:${lead.phone}`} title="Call" className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                              <Phone size={14} />
                            </a>
                            <a
                              href={`https://wa.me/91${sanitizePhone(lead.phone)}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20I%20am%20calling%20from%20${encodeURIComponent(lead.listing.title)}.`}
                              target="_blank" rel="noreferrer" title="WhatsApp"
                              className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <MessageCircle size={14} />
                            </a>
                            <Link
                              href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email ?? "")}`}
                              title="Convert to Tenant"
                              className="px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-xs font-bold whitespace-nowrap"
                            >
                              ➜ Tenant
                            </Link>
                            {!lead.isRead && <MarkLeadReadBtn leadId={lead.id} />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="md:hidden flex flex-col space-y-4 p-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className={`bg-white p-4 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-3 ${!lead.isRead ? "border-l-4 border-l-orange-400 bg-orange-50/10" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${!lead.isRead ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-600"}`}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              {lead.name}
                              {!lead.isRead && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">New</span>}
                            </div>
                            <div className="text-xs text-neutral-500">{lead.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{lead.source}</span>
                        </div>
                      </div>
                      
                      {lead.message && (
                        <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded-lg italic">
                          "{lead.message}"
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div>
                          <span className="text-xs text-neutral-400 block mb-0.5">Property</span>
                          <span className="font-semibold text-neutral-700 block truncate">{lead.listing.title}</span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 block mb-0.5">Received</span>
                          <span className="font-semibold text-neutral-700 block">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                        <a href={`tel:${lead.phone}`} className="flex-1 text-center py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold flex justify-center items-center gap-1">
                          <Phone size={14} /> Call
                        </a>
                        <a
                          href={`https://wa.me/91${sanitizePhone(lead.phone)}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20I%20am%20calling%20from%20${encodeURIComponent(lead.listing.title)}.`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 text-center py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-bold flex justify-center items-center gap-1"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email ?? "")}`}
                          className="flex-[2] text-center py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-xs font-bold"
                        >
                          Convert to Tenant
                        </Link>
                        {!lead.isRead && (
                          <div className="flex-1 text-center">
                            <MarkLeadReadBtn leadId={lead.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
