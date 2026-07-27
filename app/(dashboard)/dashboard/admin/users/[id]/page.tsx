import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft, Mail, Phone, Calendar, Shield, Building2,
  CreditCard, MessageSquare, CheckCircle2, XCircle, Clock, Ban,
} from "lucide-react";
import { UserDetailActions } from "./UserDetailActions";

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
      _count: { select: { listings: true } },
    },
  });

  // Fetch lead count separately (relation name differs per role)
  const leadCount = await db.lead.count({ where: { tenantId: userId } });

  if (!user) notFound();

  const activeSubscription = user.subscriptions.find((s) => s.status === "ACTIVE");
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const roleColor: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-100",
    OWNER: "bg-violet-50 text-violet-700 border-violet-100",
    TENANT: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft size={15} /> Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
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
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-3">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {user.phone}</span>}
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {format(user.createdAt, "d MMM yyyy")}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
              <span>ID: #{user.id}</span>
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
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
        { label: "Listings", value: user._count.listings, icon: Building2, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
          { label: "Total Leads", value: leadCount, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Subscriptions", value: user.subscriptions.length, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Active Plan", value: activeSubscription?.plan.name ?? "None", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm">
            <div className={`p-2 rounded-xl border ${s.bg} w-fit mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-xl font-black text-neutral-900">{s.value}</div>
            <div className="text-xs text-neutral-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Listings */}
        {user.role === "OWNER" && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
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
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
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
        )}

        {/* Subscription History */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
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
    </div>
  );
}
