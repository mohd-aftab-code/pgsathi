import { db } from "@/lib/db";
import { User, ShieldCheck, Mail, Phone, CalendarDays } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Manage Users - Admin",
};

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true }
      },
      _count: {
        select: { listings: true }
      }
    }
  });

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Manage Users</h1>
        <p className="text-blue-200 relative z-10">View and manage all registered tenants, owners, and administrators.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm w-full sm:w-80 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm w-full sm:w-auto outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Roles</option>
              <option value="TENANT">Tenants</option>
              <option value="OWNER">Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
          <div className="text-sm font-medium text-neutral-500 shrink-0">
            Total Users: {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-500">
                <th className="py-5 px-6">User Info</th>
                <th className="py-5 px-6">Role & Status</th>
                <th className="py-5 px-6">Platform Data</th>
                <th className="py-5 px-6">Joined</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-100 text-neutral-700 rounded-full flex items-center justify-center font-bold overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-neutral-900 text-base">{user.name}</div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <Mail size={12} /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                            <Phone size={12} /> {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <ShieldCheck size={14} /> Verified
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-neutral-400">Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {user.role === 'OWNER' ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-neutral-900">{user._count.listings} Listings</div>
                        {user.subscriptions.length > 0 ? (
                          <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                            {user.subscriptions[0].plan.name} Plan
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-neutral-500">Free Plan</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic">Tenant</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-neutral-500 font-medium flex items-center gap-2">
                    <CalendarDays size={16} />
                    {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
