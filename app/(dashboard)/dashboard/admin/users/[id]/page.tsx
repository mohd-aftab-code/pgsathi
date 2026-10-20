import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft, Mail, Phone, Calendar, Shield, Building2,
  CreditCard, MessageSquare, CheckCircle2, XCircle, Clock, Ban,
  Home, Bed, MapPin, Eye, User
} from "lucide-react";
import { UserDetailActions } from "./UserDetailActions";
import { ReattributeOwner } from "@/components/dashboard/ReattributeOwner";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) notFound();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      listings: {
        select: { id: true, title: true, status: true, city: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      subscriptions: {
        select: { id: true, status: true, amount: true, billingCycle: true, startDate: true, endDate: true, plan: { select: { name: true } } },
        orderBy: { startDate: "desc" },
        take: 5,
      },
      partnerProfile: { select: { id: true, partnerCode: true, status: true } },
      partner: { select: { id: true, partnerCode: true, user: { select: { name: true } } } },
      tenantProfiles: {
        where: { deletedAt: null },
        include: {
          listing: { select: { id: true, title: true, address: true, city: { select: { name: true } } } },
          room: { select: { id: true, name: true } },
          bed: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, phone: true } },
        },
      },
      visits: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, title: true } },
        },
      },
      leads: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, title: true } },
        },
      },
      _count: { select: { listings: true } },
    },
  });

  // Fetch lead count separately (relation name differs per role)
  const leadCount = await db.lead.count({ where: { tenantId: userId } });

  if (!user) notFound();

  const attributionPartners =
    user.role === "OWNER"
      ? (
          await db.partnerProfile.findMany({
            where: { status: "APPROVED", archivedAt: null },
            orderBy: { partnerCode: "asc" },
            take: 200,
            select: { id: true, partnerCode: true, user: { select: { name: true } } },
          })
        ).map((p) => ({ id: p.id, label: `${p.user.name} (${p.partnerCode})` }))
      : [];

  const activeSubscription = user.subscriptions.find((s) => s.status === "ACTIVE");
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const currentStay = user.tenantProfiles && user.tenantProfiles.length > 0 ? user.tenantProfiles[0] : null;

  const cleanRoomName = (name?: string | null) => {
    if (!name) return "Unassigned";
    const cleaned = name.replace(/^(room\s*)+/i, "").trim();
    return cleaned ? `Room ${cleaned}` : "Room Assigned";
  };

  const cleanBedName = (name?: string | null) => {
    if (!name) return "Unassigned";
    const cleaned = name.replace(/^(bed\s*)+/i, "").trim();
    return cleaned ? `Bed ${cleaned}` : "Bed Assigned";
  };

  const roleColor: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-100",
    OWNER: "bg-violet-50 text-violet-700 border-violet-100",
    TENANT: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link href={user.role === "TENANT" ? "/dashboard/admin/users?role=TENANT" : "/dashboard/admin/users"} className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft size={15} /> Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center font-black text-2xl text-violet-700 shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-extrabold text-neutral-900">{user.name || "—"}</h1>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${roleColor[user.role] ?? "bg-neutral-50 text-neutral-600"}`}>
                {user.role}
              </span>
              {!user.isActive && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 uppercase tracking-wider flex items-center gap-1">
                  <Ban size={10} /> BANNED
                </span>
              )}
              {user.isVerified && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={10} /> VERIFIED
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-3">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {user.phone}</span>}
              <span className="flex items-center gap-1.5" title="Registration Date & Time">
                <Calendar size={13} className="text-violet-600" /> Joined {format(user.createdAt, "d MMM yyyy, h:mm a")} ({formatDistanceToNow(user.createdAt, { addSuffix: true })})
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>User ID: #{user.id}</span>
              {user.lastLoginAt && <span>Last login: {formatDistanceToNow(user.lastLoginAt, { addSuffix: true })}</span>}
              {user.partnerProfile && (
                <Link href={`/dashboard/admin/partners/${user.partnerProfile.id}`} className="text-violet-600 font-semibold hover:underline">
                  Partner · {user.partnerProfile.partnerCode}
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <UserDetailActions userId={user.id} userName={user.name || "User"} userRole={user.role} isActive={user.isActive} />
        </div>

        {/* ── Partner attribution ────────────────────────────────── */}
        {user.role === "OWNER" && (
          <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-neutral-500">Partner attribution: </span>
              {user.partner ? (
                <Link href={`/dashboard/admin/partners/${user.partner.id}`} className="font-bold text-violet-600 hover:underline">
                  {user.partner.user.name} ({user.partner.partnerCode})
                </Link>
              ) : (
                <span className="font-semibold text-neutral-400">koi nahi — self-registered</span>
              )}
              {user.partnerAttributedAt && (
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-2">
                  since {format(user.partnerAttributedAt, "d MMM yyyy")}
                </span>
              )}
            </div>
            <ReattributeOwner
              ownerId={user.id}
              ownerName={user.name || "Owner"}
              currentPartner={
                user.partner
                  ? { id: user.partner.id, label: `${user.partner.user.name} (${user.partner.partnerCode})` }
                  : null
              }
              partners={attributionPartners}
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      {user.role === "OWNER" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Listings", value: user._count.listings, icon: Building2, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
            { label: "Total Leads", value: leadCount, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
            { label: "Subscriptions", value: user.subscriptions.length, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { label: "Active Plan", value: activeSubscription?.plan.name ?? "None", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-4 shadow-sm">
              <div className={`p-2 rounded-xl border ${s.bg} w-fit mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="text-xl font-black text-neutral-900">{s.value}</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Current Stay", value: currentStay ? currentStay.status : "No Active Stay", icon: Home, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { label: "Monthly Rent", value: currentStay ? inr(currentStay.monthlyRent) : "—", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { label: "Total Inquiries", value: leadCount, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
            { label: "Visits Scheduled", value: user.visits.length, icon: Calendar, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-4 shadow-sm">
              <div className={`p-2 rounded-xl border ${s.bg} w-fit mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="text-xl font-black text-neutral-900">{s.value}</div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Panels */}
      {user.role === "OWNER" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Listings */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Building2 size={14} className="text-violet-600" /> Their Listings ({user._count.listings})
              </h2>
              <Link href={`/dashboard/admin/verify?query=${encodeURIComponent(user.name ?? "")}`} className="text-xs text-violet-600 font-semibold hover:underline">
                View in Verify →
              </Link>
            </div>
            <div className="divide-y divide-neutral-50">
              {user.listings.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-7 h-7 rounded-2xl flex items-center justify-center shrink-0 ${
                    l.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    l.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    "bg-neutral-100 text-neutral-400"
                  }`}>
                    {l.status === "ACTIVE" ? <CheckCircle2 size={13} /> : l.status === "PENDING" ? <Clock size={13} /> : <XCircle size={13} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{l.title}</p>
                    <p className="text-[10px] text-neutral-400">{l.city?.name} · {formatDistanceToNow(l.createdAt, { addSuffix: true })}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    l.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    l.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-neutral-100 text-neutral-500"
                  }`}>{l.status}</span>
                </div>
              ))}
              {user.listings.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-8">No listings yet.</p>
              )}
            </div>
          </div>

          {/* Subscription History */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard size={14} className="text-blue-600" /> Subscription History
              </h2>
            </div>
            <div className="divide-y divide-neutral-50">
              {user.subscriptions.map((sub) => (
                <div key={sub.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800">{sub.plan?.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      {format(sub.startDate, "d MMM yy")} → {format(sub.endDate, "d MMM yy")} · {sub.billingCycle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-neutral-800">{inr(sub.amount)}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      sub.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                      sub.status === "EXPIRED" ? "bg-neutral-100 text-neutral-500" :
                      "bg-amber-50 text-amber-700"
                    }`}>{sub.status}</span>
                  </div>
                </div>
              ))}
              {user.subscriptions.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-8">No subscriptions.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tenant PG Stay Details */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Home size={14} className="text-emerald-600" /> PG Stay & Accommodation
              </h2>
              {currentStay && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {currentStay.status}
                </span>
              )}
            </div>
            <div className="p-5">
              {currentStay ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
                    <div className="font-black text-sm text-neutral-900 uppercase tracking-tight">
                      {currentStay.listing.title}
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span>{currentStay.listing.address || currentStay.listing.city?.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Room</span>
                      <span className="font-black text-neutral-900 text-sm mt-0.5 block">{cleanRoomName(currentStay.room?.name)}</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Bed</span>
                      <span className="font-black text-neutral-900 text-sm mt-0.5 block">{cleanBedName(currentStay.bed?.name)}</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Monthly Rent</span>
                      <span className="font-black text-emerald-700 text-sm mt-0.5 block">{inr(currentStay.monthlyRent)}</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Check-in Timestamp</span>
                      <span className="font-bold text-neutral-900 text-xs mt-0.5 block">
                        {format(currentStay.checkInDate, "d MMM yyyy, h:mm a")}
                      </span>
                    </div>
                  </div>

                  {currentStay.owner && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">PG Owner</span>
                        <span className="font-black text-neutral-900 text-xs">{currentStay.owner.name}</span>
                        <span className="text-[10px] text-neutral-500 ml-1">({currentStay.owner.phone})</span>
                      </div>
                      <Link
                        href={`/dashboard/admin/users/${currentStay.owner.id}`}
                        className="text-xs font-black text-violet-700 hover:underline"
                      >
                        View Owner →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <User size={24} className="mx-auto text-neutral-300 mb-2" />
                  Yeh user abhi kisi PG me staying/allocated nahi hai.
                  <p className="text-[10px] text-neutral-400 mt-1">Platform user exploring PGs or booked visits.</p>
                </div>
              )}
            </div>
          </div>

          {/* Visits & Inquiries */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Calendar size={14} className="text-violet-600" /> Visits Booked & Leads ({user.visits.length + user.leads.length})
              </h2>
            </div>
            <div className="divide-y divide-neutral-50 max-h-[380px] overflow-y-auto">
              {user.visits.map((v) => (
                <div key={`v-${v.id}`} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-violet-100 text-violet-700 uppercase">
                      Visit Booking
                    </span>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-1">{v.listing.title}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Date: {format(v.visitDate, "d MMM yyyy")} · Booked: {formatDistanceToNow(v.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 uppercase">
                    {v.status}
                  </span>
                </div>
              ))}
              {user.leads.map((l) => (
                <div key={`l-${l.id}`} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                      Inquiry / Lead
                    </span>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-1">{l.listing?.title || "PG Inquiry"}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Sent {formatDistanceToNow(l.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                    Lead
                  </span>
                </div>
              ))}
              {user.visits.length === 0 && user.leads.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-10">No visits or leads submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
