import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CalendarClock, MapPin, Building2, Calendar, CreditCard, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "My Bookings - Tenant Dashboard" };

export default async function TenantBookingsPage() {
  const session = await auth();
  const phone = (session?.user as any)?.phone || "";
  const email = (session?.user as any)?.email || "";

  const whereTenant: any = [];
  if (phone) whereTenant.push({ phone });
  if (email) whereTenant.push({ email });

  let bookings: any[] = [];
  if (whereTenant.length > 0) {
    bookings = await db.pgTenant.findMany({
      where: { OR: whereTenant },
      include: {
        listing: {
          include: { city: true, locality: true }
        },
        room: true,
        bed: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <div>
      <div className="mb-6 lg:mb-8 border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          <CalendarClock className="text-violet-600" /> My Bookings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your active and past stays.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 text-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarClock size={32} className="text-violet-300" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Bookings Found</h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            We couldn't find any bookings associated with your phone number or email address.
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            Find a PG
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'NOTICE' ? 'bg-orange-100 text-orange-700' : 
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm text-neutral-500 flex items-center gap-1 font-medium">
                      <Calendar size={14} /> Joined {format(new Date(booking.checkInDate), 'MMM yyyy')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">{booking.listing.title}</h3>
                  <p className="text-neutral-500 text-sm flex items-center gap-1.5 mb-4">
                    <MapPin size={14} className="shrink-0" />
                    {booking.listing.locality?.name}, {booking.listing.city.name}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <div>
                      <p className="text-xs text-neutral-500 font-medium mb-0.5">Room</p>
                      <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <Building2 size={14} className="text-violet-500" />
                        {booking.room?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium mb-0.5">Bed</p>
                      <p className="font-bold text-neutral-900">{booking.bed?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium mb-0.5">Monthly Rent</p>
                      <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-violet-500" />
                        ₹{booking.monthlyRent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium mb-0.5">Rent Due</p>
                      <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-500" />
                        {booking.rentDueDay}th of month
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right: Actions */}
                <div className="shrink-0 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-neutral-100 pt-5 md:pt-0 md:pl-6">
                  <Link 
                    href={`/dashboard/tenant/receipts?tenantId=${booking.id}`}
                    className="w-full md:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-medium text-sm transition-colors text-center shadow-sm"
                  >
                    View Receipts
                  </Link>
                  <Link 
                    href={`/pg/${booking.listing.slug}`}
                    className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl font-medium text-sm transition-colors text-center shadow-sm"
                  >
                    View PG Details
                  </Link>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
