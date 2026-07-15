import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Mail, Phone, ExternalLink, CalendarDays, MessageCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import MarkReadButton from "@/components/listings/MarkReadButton";
import { getPlanTier, isTrialActive } from "@/lib/manage-auth";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";

export const metadata = {
  title: "Visits & Leads - Owner Dashboard",
};

export default async function VisitsInboxPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ownerId = parseInt(session.user.id!);

  const tier = await getPlanTier(ownerId);
  const trial = await isTrialActive(ownerId);
  const hasPaidPlan = tier === "GROWTH" || tier === "PRO";
  const hasAccess = hasPaidPlan || trial.active;

  // Fetch leads
  const leads = await db.lead.findMany({
    where: { listing: { ownerId } },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch visit bookings
  const visits = await db.visitBooking.findMany({
    where: { listing: { ownerId } },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: { visitDate: "asc" },
  });

  const exportData = leads.map(l => ({
    "Name": l.name,
    "Phone": l.phone,
    "Email": l.email || "",
    "Source": l.source,
    "Property": l.listing.title,
    "Status": l.isRead ? "Read" : "Unread",
    "Date": new Date(l.createdAt).toLocaleDateString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Scheduled Visits & Leads</h1>
        <p className="text-neutral-500 mt-1">Manage physical visits and tenant inquiries pipeline.</p>
      </div>

      <div className="space-y-8">
        {/* Visits Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CalendarClock className="text-primary-600" /> Upcoming Physical Visits
          </h2>
          {visits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visits.map(visit => (
                <div key={visit.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-lg">{visit.name}</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${visit.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600 mb-4 space-y-2">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-neutral-400"/> {visit.phone}</div>
                    <div className="flex items-center gap-2 text-primary-700 font-semibold bg-primary-50 w-fit px-2 py-1 rounded">
                      <CalendarDays size={14}/> {format(new Date(visit.visitDate), 'dd MMM yyyy, h:mm a')}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                    <Link href={`/pg/${visit.listing.slug}`} className="text-xs text-neutral-500 font-medium hover:text-primary-600 flex items-center gap-1 line-clamp-1">
                      <ExternalLink size={12} /> {visit.listing.title}
                    </Link>
                    {hasAccess ? (
                      <a 
                        href={`https://wa.me/91${visit.phone}?text=Hi%20${visit.name},%20confirming%20your%20visit%20at%20${format(new Date(visit.visitDate), 'h:mm a')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-green-600 bg-green-50 p-1.5 rounded-lg hover:bg-green-100 transition"
                      >
                        <MessageCircle size={16} />
                      </a>
                    ) : (
                      <Link
                        href="/dashboard/owner/subscription/upgrade"
                        className="text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition text-[10px] font-bold shadow-sm"
                      >
                        Unlock WA
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 text-center text-neutral-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/50 pointer-events-none"></div>
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-400 relative z-10">
                <CalendarClock size={32} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 relative z-10">No physical visits scheduled</h3>
              <p className="text-sm font-medium relative z-10">Tenants can book visits directly from your PG page.</p>
            </div>
          )}
        </section>

        {/* Leads Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Mail className="text-neutral-600" /> General Inquiries (Leads)
            </h2>
            <ExportCsvButton data={exportData} filename="Leads_Export" tier={tier} />
          </div>
          <div className="mt-4">
            {leads.length > 0 ? (
              <div className="overflow-x-auto pb-10 px-1 -mx-1">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest font-extrabold text-neutral-400">
                      <th className="pb-2 px-6">Tenant Name</th>
                      <th className="pb-2 px-6">Contact & Actions</th>
                      <th className="pb-2 px-6">Property Interested</th>
                      <th className="pb-2 px-6 text-right">Received</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {leads.map((lead) => (
                      <tr key={lead.id} className={`bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group ${!lead.isRead ? 'ring-2 ring-orange-100 shadow-orange-100/50' : ''}`}>
                        <td className={`py-5 px-6 rounded-l-2xl border-y border-l ${!lead.isRead ? 'border-orange-200 bg-orange-50/30' : 'border-neutral-100'}`}>
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
                        <td className={`py-5 px-6 border-y ${!lead.isRead ? 'border-orange-200 bg-orange-50/30' : 'border-neutral-100'}`}>
                          <div className="flex flex-col gap-2">
                            <div className="font-bold text-neutral-800 tracking-wide">
                              {hasAccess ? lead.phone : "98XXXXXX" + lead.phone.slice(-2)}
                            </div>
                            <div className="flex items-center gap-2">
                              {hasAccess ? (
                                <>
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
                                </>
                              ) : (
                                <Link
                                  href="/dashboard/owner/subscription/upgrade"
                                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                >
                                  Unlock Number
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`py-5 px-6 border-y ${!lead.isRead ? 'border-orange-200 bg-orange-50/30' : 'border-neutral-100'}`}>
                          <div className="space-y-1.5">
                            <Link href={`/pg/${lead.listing.slug}`} className="text-neutral-900 font-bold hover:text-primary-600 transition-colors flex items-center gap-1.5 line-clamp-1">
                              {lead.listing.title} <ExternalLink size={14} />
                            </Link>
                            {lead.message && (
                              <div className="text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 inline-block">
                                &ldquo;{lead.message}&rdquo;
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`py-5 px-6 rounded-r-2xl border-y border-r text-right ${!lead.isRead ? 'border-orange-200 bg-orange-50/30' : 'border-neutral-100'}`}>
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-neutral-900">
                              {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                            </span>
                            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                              <CalendarDays size={12} />
                              {format(new Date(lead.createdAt), 'dd MMM yyyy, h:mm a')}
                            </span>
                            <MarkReadButton leadId={lead.id} isRead={lead.isRead} />
                            <Link
                              href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email ?? "")}`}
                              className="inline-flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              ➜ Convert to Tenant
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/50 pointer-events-none"></div>
                <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 relative z-10 shadow-inner">
                  <Mail size={40} />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-3 relative z-10">Your Inbox is Empty</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-8 text-base font-medium relative z-10">
                  You haven't received any leads yet. Incoming inquiries will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
