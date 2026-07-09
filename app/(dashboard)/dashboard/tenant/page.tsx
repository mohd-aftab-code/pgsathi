import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Heart, CalendarClock, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function TenantDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const phone = (session?.user as any)?.phone || "";
  const email = (session?.user as any)?.email || "";

  // 1. Fetch Saved PGs Count
  const savedCount = await db.savedListing.count({
    where: { userId },
  });

  // 2. Fetch Active Bookings Count
  // Match PgTenant by phone OR email
  const whereTenant: any = [];
  if (phone) whereTenant.push({ phone });
  if (email) whereTenant.push({ email });

  let bookingsCount = 0;
  let receiptsCount = 0;

  if (whereTenant.length > 0) {
    const tenants = await db.pgTenant.findMany({
      where: {
        OR: whereTenant,
        status: { in: ["ACTIVE", "NOTICE"] }
      },
      select: { id: true }
    });
    bookingsCount = tenants.length;

    if (tenants.length > 0) {
      const tenantIds = tenants.map((t) => t.id);
      receiptsCount = await db.pgRentBill.count({
        where: { tenantId: { in: tenantIds } }
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">Welcome, {session?.user?.name || "Tenant"}!</h1>
          <p className="text-sm md:text-base text-neutral-500 mt-1">Here's your PG hunting and booking overview.</p>
        </div>
        <Link 
          href="/search" 
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
        >
          Find a PG <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none hidden md:block"></div>
          <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500 text-sm md:text-base">Saved PGs</h3>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 text-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
              <Heart size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 relative z-10">{savedCount}</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none hidden md:block"></div>
          <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500 text-sm md:text-base">Active Bookings</h3>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
              <CalendarClock size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 relative z-10">{bookingsCount}</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-neutral-200 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full blur-3xl transition-transform group-hover:scale-110 pointer-events-none hidden md:block"></div>
          <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
            <h3 className="font-bold text-neutral-500 text-sm md:text-base">Rent Bills</h3>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 text-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
              <Receipt size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 relative z-10">{receiptsCount}</p>
        </div>
      </div>

      {/* Empty State / Suggestions */}
      {savedCount === 0 && bookingsCount === 0 && (
        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 text-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-violet-300" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">No Saved PGs Yet</h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            Start browsing verified zero-brokerage PGs and save your favorites here to compare them easily.
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            Explore PGs in your City
          </Link>
        </div>
      )}
    </div>
  );
}
