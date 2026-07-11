import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Heart, CalendarClock, Receipt, ArrowRight, Building2, BedDouble, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function TenantDashboardPage() {
  const session = await auth();
  const userId  = session?.user?.id ? parseInt(session.user.id) : 0;
  const phone   = (session?.user as any)?.phone || "";
  const email   = (session?.user as any)?.email || "";
  const month   = currentMonth();

  // Build tenant OR filter
  const whereTenant: any = [];
  if (phone)  whereTenant.push({ phone });
  if (email)  whereTenant.push({ email });

  // 1. Saved PG count
  const savedCount = await db.savedListing.count({ where: { userId } });

  let activeTenancy: any = null;
  let rentStatus: "PAID" | "PARTIAL" | "PENDING" | null = null;
  let rentDue = 0;
  let openComplaints = 0;
  let receiptsCount = 0;

  if (whereTenant.length > 0) {
    // 2. Find active tenancy linked by phone/email
    activeTenancy = await db.pgTenant.findFirst({
      where: { OR: whereTenant, status: { in: ["ACTIVE", "NOTICE"] } },
      include: {
        listing: { select: { title: true } },
        room:    { select: { name: true } },
        bed:     { select: { name: true } },
      },
    });

    if (activeTenancy) {
      // 3. This month's rent status
      const payments = await db.pgPayment.findMany({
        where: { tenantId: activeTenancy.id, forMonth: month, type: "RENT", voided: false },
        select: { amount: true },
      });
      const paid = payments.reduce((s: number, p: any) => s + p.amount, 0);
      const due  = Math.max(0, activeTenancy.monthlyRent - paid);
      rentDue = due;
      if (due === 0) rentStatus = "PAID";
      else if (paid > 0) rentStatus = "PARTIAL";
      else rentStatus = "PENDING";

      // 4. Open complaints
      openComplaints = await db.pgComplaint.count({
        where: { tenantId: activeTenancy.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
      });

      // 5. Total bills
      receiptsCount = await db.pgRentBill.count({ where: { tenantId: activeTenancy.id } });
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Welcome, {session?.user?.name || "Tenant"}! 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Here's your PG overview for today.</p>
        </div>
        <Link href="/search" className="btn-primary text-sm flex items-center gap-2">
          Find a PG <ArrowRight size={16} />
        </Link>
      </div>

      {/* Active PG Info Card */}
      {activeTenancy ? (
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 text-white shadow-lg shadow-violet-200">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Your Current PG</p>
              <h2 className="text-xl font-bold">{activeTenancy.listing?.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-violet-100">
                {activeTenancy.room && (
                  <span className="flex items-center gap-1"><BedDouble size={14} /> Room {activeTenancy.room.name}</span>
                )}
                {activeTenancy.bed && (
                  <span>· Bed {activeTenancy.bed.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <Wallet size={14} /> Rent: {formatINR(activeTenancy.monthlyRent)}/mo
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${
              activeTenancy.status === "ACTIVE" ? "bg-green-400/20 text-green-200" : "bg-amber-400/20 text-amber-200"
            }`}>
              {activeTenancy.status}
            </span>
          </div>

          {/* Rent Status */}
          <div className="mt-5 pt-5 border-t border-violet-500/30">
            {rentStatus === "PAID" ? (
              <div className="flex items-center gap-2 text-green-300 font-semibold">
                <CheckCircle2 size={18} /> This month's rent is fully paid ✓
              </div>
            ) : rentStatus === "PARTIAL" ? (
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-semibold flex items-center gap-2">
                  <AlertCircle size={18} /> Partial payment — {formatINR(rentDue)} remaining
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-red-300 font-semibold flex items-center gap-2">
                  <AlertCircle size={18} /> Rent Due: {formatINR(rentDue)}
                </span>
                <Link href="/dashboard/tenant/receipts" className="bg-white text-violet-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors">
                  View Bill
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800">No active PG tenancy found</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              Your account ({phone || email}) is not linked to any PG. Ask your PG manager to add you.
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saved PGs",       value: savedCount,      icon: Heart,         color: "text-pink-600",   bg: "bg-pink-50",   href: "/dashboard/tenant/saved" },
          { label: "Active Booking",  value: activeTenancy ? 1 : 0, icon: CalendarClock, color: "text-blue-600",  bg: "bg-blue-50",  href: "#" },
          { label: "Rent Bills",      value: receiptsCount,   icon: Receipt,       color: "text-green-600",  bg: "bg-green-50",  href: "/dashboard/tenant/receipts" },
          { label: "Open Complaints", value: openComplaints,  icon: AlertCircle,   color: "text-orange-600", bg: "bg-orange-50", href: "/dashboard/tenant/complaints" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex items-center gap-3 hover:border-violet-300 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/tenant/receipts" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:border-violet-300 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <Receipt size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 group-hover:text-violet-700 transition-colors">View Rent Bills</p>
            <p className="text-xs text-neutral-500 mt-0.5">Check payment history</p>
          </div>
        </Link>

        <Link href="/dashboard/tenant/complaints" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:border-orange-300 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <AlertCircle size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 group-hover:text-orange-700 transition-colors">File a Complaint</p>
            <p className="text-xs text-neutral-500 mt-0.5">Report any issue instantly</p>
          </div>
        </Link>

        <Link href="/search" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Building2 size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 group-hover:text-blue-700 transition-colors">Explore PGs</p>
            <p className="text-xs text-neutral-500 mt-0.5">Find your next home</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
