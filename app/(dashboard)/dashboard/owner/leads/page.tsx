import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Mail, Phone, ExternalLink, CalendarDays, MessageCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { LeadStatusControl } from "@/components/manage/LeadStatusControl";
import { getPlanTier, isTrialActive, isPaidTier, getPlanCapabilities } from "@/lib/manage-auth";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";
import { LeadsFilter } from "@/components/dashboard/LeadsFilter";

export const metadata = {
  title: "Visits & Leads - Owner Dashboard",
};

export default async function VisitsInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ownerId = parseInt(session.user.id!);

  const [tier, trial, capabilities] = await Promise.all([
    getPlanTier(ownerId),
    isTrialActive(ownerId),
    getPlanCapabilities(ownerId),
  ]);
  const hasPaidPlan = isPaidTier(tier);
  // Lead phone/contact unlock: the plan's `leads` capability (admin-controlled),
  // OR an active trial — so a trial keeps unlocking leads as it did before.
  const hasAccess = capabilities.leads || trial.active;

  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const status = typeof sp.status === 'string' ? sp.status : undefined;
  const stage = typeof sp.stage === 'string' ? sp.stage : undefined;

  const PIPELINE = [
    { value: "NEW", label: "New", cls: "bg-orange-50 text-orange-700 border-orange-200", active: "bg-orange-600 text-white border-orange-600" },
    { value: "CONTACTED", label: "Contacted", cls: "bg-blue-50 text-blue-700 border-blue-200", active: "bg-blue-600 text-white border-blue-600" },
    { value: "VISIT_SCHEDULED", label: "Visit set", cls: "bg-violet-50 text-violet-700 border-violet-200", active: "bg-violet-600 text-white border-violet-600" },
    { value: "CONVERTED", label: "Converted", cls: "bg-green-50 text-green-700 border-green-200", active: "bg-green-600 text-white border-green-600" },
    { value: "LOST", label: "Lost", cls: "bg-neutral-100 text-neutral-500 border-neutral-200/60", active: "bg-neutral-700 text-white border-neutral-700" },
  ];

  // Build where clause
  const whereClause: any = { listing: { ownerId } };

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (status === 'UNREAD') {
    whereClause.isRead = false;
  } else if (status === 'READ') {
    whereClause.isRead = true;
  }

  if (stage && PIPELINE.some((s) => s.value === stage)) {
    whereClause.status = stage;
  }

  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : "1"));
  const pageSize = 20;

  // Fetch leads
  const [totalFilteredLeads, leads] = await Promise.all([
    db.lead.count({ where: whereClause }),
    db.lead.findMany({
      where: whereClause,
      include: { listing: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ]);
  
  const totalPages = Math.max(1, Math.ceil(totalFilteredLeads / pageSize));

  // Fetch visit bookings
  const visits = await db.visitBooking.findMany({
    where: { listing: { ownerId } },
    include: { listing: { select: { title: true, slug: true } } },
    orderBy: { visitDate: "asc" },
  });

  // Pipeline counts (overall for the owner) — drives the summary strip + stage filter
  const stageGroups = await db.lead.groupBy({
    by: ["status"],
    where: { listing: { ownerId } },
    _count: { _all: true },
  });
  const countBy: Record<string, number> = {};
  for (const g of stageGroups) countBy[g.status] = g._count._all;
  const totalLeads = Object.values(countBy).reduce((a, b) => a + b, 0);
  const convertedLeads = countBy["CONVERTED"] ?? 0;
  const convRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const exportData = leads.map(l => ({
    "Name": l.name,
    "Phone": l.phone,
    "Email": l.email || "",
    "Source": l.source,
    "Property": l.listing.title,
    "Status": l.isRead ? "Read" : "Unread",
    "Date": new Date(l.createdAt).toLocaleDateString(),
  }));

  const sanitizePhone = (p: string) => p.replace(/\D/g, '').replace(/^(91)/, '');

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Scheduled Visits & Leads</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Manage physical visits and tenant inquiries pipeline.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Visits Section */}
        <section>
          <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CalendarClock size={16} className="text-violet-600" /> Upcoming Physical Visits
          </h2>
          {visits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {visits.map(visit => (
                <div key={visit.id} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-sm text-neutral-900">{visit.name}</div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-xl uppercase tracking-wider ${visit.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600 mb-4 space-y-1.5 font-medium">
                    <div className="flex items-center gap-2"><Phone size={12} className="text-neutral-400"/> {visit.phone}</div>
                    <div className="flex items-center gap-2 text-violet-700 font-bold bg-violet-50/80 w-fit px-2 py-1 rounded-xl">
                      <CalendarDays size={12}/> {format(new Date(visit.visitDate), 'dd MMM yyyy, h:mm a')}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-neutral-100/60 flex justify-between items-center">
                    <Link href={`/pg/${visit.listing.slug}`} className="text-[10px] text-neutral-500 font-bold hover:text-violet-600 flex items-center gap-1 uppercase tracking-wider line-clamp-1">
                      <ExternalLink size={10} /> {visit.listing.title}
                    </Link>
                    {hasAccess ? (
                      <a 
                        href={`https://wa.me/91${sanitizePhone(visit.phone)}?text=Hi%20${visit.name},%20confirming%20your%20visit%20at%20${format(new Date(visit.visitDate), 'h:mm a')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-600 bg-emerald-50 p-1.5 rounded-2xl hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle size={14} />
                      </a>
                    ) : (
                      <Link
                        href="/dashboard/owner/subscription/upgrade"
                        className="text-white bg-indigo-600 px-2 py-1 rounded-xl hover:bg-indigo-700 transition-colors text-[9px] font-bold shadow-sm uppercase tracking-wider"
                      >
                        Unlock WA
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-md p-10 rounded-2xl shadow-sm border border-neutral-200/60 text-center text-neutral-500 relative overflow-hidden">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-400 relative z-10">
                <CalendarClock size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1 relative z-10">No physical visits scheduled</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider relative z-10">Tenants can book visits directly from your PG page.</p>
            </div>
          )}
        </section>

        {/* Leads Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={16} className="text-violet-600" /> General Inquiries (Leads)
            </h2>
            <ExportCsvButton data={exportData} filename="Leads_Export" canExport={capabilities.csvExport} />
          </div>
          
          {/* Pipeline summary + stage filter */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Link
              href={`/dashboard/owner/leads${q ? `?q=${encodeURIComponent(q)}` : ""}`}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-colors uppercase tracking-wider ${!stage ? "bg-neutral-900 text-white border-neutral-900" : "bg-white/60 backdrop-blur-md text-neutral-600 border-neutral-200/60 hover:bg-neutral-50"}`}
            >
              All <span className="tabular-nums ml-0.5">{totalLeads}</span>
            </Link>
            {PIPELINE.map((s) => {
              const active = stage === s.value;
              const href = `/dashboard/owner/leads?stage=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
              return (
                <Link
                  key={s.value}
                  href={href}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-colors hover:opacity-90 uppercase tracking-wider ${active ? s.active : s.cls}`}
                >
                  {s.label} <span className="tabular-nums ml-0.5">{countBy[s.value] ?? 0}</span>
                </Link>
              );
            })}
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-50 border border-neutral-200/60 px-2.5 py-1.5 rounded-xl">
              Conv: <span className="text-emerald-600 font-black tabular-nums">{convRate}%</span>{" "}
              <span className="text-neutral-400 font-medium">({convertedLeads}/{totalLeads})</span>
            </span>
          </div>

          <LeadsFilter />

          <div className="mt-3">
            {leads.length > 0 ? (
              <div className="pb-8">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto px-1 -mx-1">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest font-black text-neutral-400 bg-neutral-50/40">
                        <th className="py-2.5 px-4 rounded-l-lg border-y border-l border-neutral-100/60">Tenant Name</th>
                        <th className="py-2.5 px-4 border-y border-neutral-100/60">Contact & Actions</th>
                        <th className="py-2.5 px-4 border-y border-neutral-100/60">Property Interested</th>
                        <th className="py-2.5 px-4 text-right rounded-r-lg border-y border-r border-neutral-100/60">Received</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {leads.map((lead) => (
                        <tr key={lead.id} className={`bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group ${!lead.isRead ? 'ring-1 ring-orange-200' : ''}`}>
                          <td className={`py-3 px-4 rounded-l-xl border-y border-l ${!lead.isRead ? 'border-orange-200 bg-orange-50/50' : 'border-neutral-200/60'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${!lead.isRead ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-neutral-900 flex items-center gap-2 text-[13px]">
                                  {lead.name}
                                  {!lead.isRead && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm"></span>}
                                </div>
                                <div className="text-[9px] text-neutral-500 mt-0.5 uppercase tracking-wider font-bold">{lead.source} Lead</div>
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-4 border-y ${!lead.isRead ? 'border-orange-200 bg-orange-50/50' : 'border-neutral-200/60'}`}>
                            <div className="flex flex-col gap-1.5">
                              <div className="font-bold text-neutral-800 tracking-wide text-xs">
                                {hasAccess ? lead.phone : "98XXXXXX" + lead.phone.slice(-2)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {hasAccess ? (
                                  <>
                                    <a 
                                      href={`tel:${lead.phone}`} 
                                      className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-2xl transition-colors"
                                    >
                                      <Phone size={12} /> Call
                                    </a>
                                    <a 
                                      href={`https://wa.me/91${sanitizePhone(lead.phone)}?text=Hi%20${lead.name},%20I%20am%20reaching%20out%20regarding%20your%20inquiry%20for%20${lead.listing.title}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-2xl transition-colors"
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </a>
                                  </>
                                ) : (
                                  <Link
                                    href="/dashboard/owner/subscription/upgrade"
                                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-2xl transition-colors shadow-sm"
                                  >
                                    Unlock Number
                                  </Link>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-4 border-y ${!lead.isRead ? 'border-orange-200 bg-orange-50/50' : 'border-neutral-200/60'}`}>
                            <div className="space-y-1">
                              <Link href={`/pg/${lead.listing.slug}`} className="text-neutral-900 font-bold hover:text-violet-600 transition-colors flex items-center gap-1.5 line-clamp-1 text-xs">
                                {lead.listing.title} <ExternalLink size={12} />
                              </Link>
                              {lead.message && (
                                <div className="text-[10px] text-neutral-500 italic bg-white/60 p-2 rounded-2xl border border-neutral-100/60 inline-block font-medium">
                                  &ldquo;{lead.message}&rdquo;
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`py-3 px-4 rounded-r-xl border-y border-r text-right ${!lead.isRead ? 'border-orange-200 bg-orange-50/50' : 'border-neutral-200/60'}`}>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-400 flex items-center gap-1 uppercase tracking-wider">
                                <CalendarDays size={10} />
                                {format(new Date(lead.createdAt), 'dd MMM yyyy, h:mm a')}
                              </span>
                              <LeadStatusControl leadId={lead.id} status={lead.status} followUpAt={lead.followUpAt?.toISOString() ?? null} notes={lead.notes ?? null} />
                              <Link
                                href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email ?? "")}`}
                                className="inline-flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-1 rounded-xl transition-colors uppercase tracking-wider"
                              >
                                ➜ Convert
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className={`bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border p-4 flex flex-col gap-3 ${!lead.isRead ? 'border-orange-200 bg-orange-50/50' : 'border-neutral-200/60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${!lead.isRead ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'}`}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                              {lead.name}
                              {!lead.isRead && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm"></span>}
                            </div>
                            <div className="text-[9px] text-neutral-500 mt-0.5 font-bold uppercase tracking-wider">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</div>
                          </div>
                        </div>
                        <LeadStatusControl leadId={lead.id} status={lead.status} followUpAt={lead.followUpAt?.toISOString() ?? null} notes={lead.notes ?? null} />
                      </div>

                      <div className="space-y-1">
                        <Link href={`/pg/${lead.listing.slug}`} className="text-neutral-900 font-bold hover:text-violet-600 transition-colors flex items-center gap-1.5 line-clamp-1 text-xs">
                          {lead.listing.title} <ExternalLink size={12} />
                        </Link>
                        {lead.message && (
                          <div className="text-[10px] text-neutral-500 italic bg-white/60 p-2 rounded-2xl border border-neutral-100/60 inline-block line-clamp-2 font-medium">
                            &ldquo;{lead.message}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-neutral-100/60 flex items-center justify-between gap-2">
                        {hasAccess ? (
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${lead.phone}`} className="h-8 px-2.5 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-colors text-[10px] font-bold gap-1 uppercase tracking-wider">
                              <Phone size={12} /> Call
                            </a>
                            <a href={`https://wa.me/91${sanitizePhone(lead.phone)}`} target="_blank" rel="noreferrer" className="h-8 px-2.5 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl transition-colors text-[10px] font-bold gap-1 uppercase tracking-wider">
                              <MessageCircle size={12} /> WA
                            </a>
                          </div>
                        ) : (
                          <Link href="/dashboard/owner/subscription/upgrade" className="text-[10px] bg-indigo-600 text-white px-2.5 py-1.5 rounded-2xl font-bold shadow-sm uppercase tracking-wider">Unlock</Link>
                        )}
                        <Link
                          href={`/dashboard/manager/tenants/new?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email ?? "")}`}
                          className="bg-violet-50 hover:bg-violet-100 text-violet-700 text-[10px] font-bold px-2.5 py-1.5 rounded-2xl transition-colors uppercase tracking-wider"
                        >
                          Convert
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-md p-16 rounded-3xl shadow-sm border border-neutral-200/60 text-center relative overflow-hidden">
                <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 relative z-10 shadow-inner">
                  <Mail size={40} />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-3 relative z-10">No leads found</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-8 text-[10px] font-bold uppercase tracking-wider relative z-10">
                  {q || status !== 'ALL' ? "Try adjusting your filters or search query." : "You haven't received any leads yet."}
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span></span>
                <div className="flex gap-1">
                  <Link
                    href={`/dashboard/owner/leads?${q ? `q=${encodeURIComponent(q)}&` : ""}${stage ? `stage=${stage}&` : ""}page=${page - 1}`}
                    aria-disabled={page <= 1}
                    className={`flex items-center gap-1 text-[10px] font-bold border border-neutral-200/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${page <= 1 ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50" : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md"}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={`/dashboard/owner/leads?${q ? `q=${encodeURIComponent(q)}&` : ""}${stage ? `stage=${stage}&` : ""}page=${page + 1}`}
                    aria-disabled={page >= totalPages}
                    className={`flex items-center gap-1 text-[10px] font-bold border border-neutral-200/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider ${page >= totalPages ? "opacity-40 pointer-events-none text-neutral-400 bg-neutral-50/50" : "text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md"}`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
