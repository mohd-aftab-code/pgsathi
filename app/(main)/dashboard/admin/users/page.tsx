import { db } from "@/lib/db";
import { UserCircle } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { listings: true, subscriptions: true }
      }
    }
  });

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">User Directory</h1>
        <p className="text-neutral-300 relative z-10">View all registered users on the platform.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs uppercase tracking-wider font-bold text-neutral-500">
                <th className="py-5 px-6">User</th>
                <th className="py-5 px-6">Role</th>
                <th className="py-5 px-6">Contact</th>
                <th className="py-5 px-6">Joined</th>
                <th className="py-5 px-6 text-right">Stats</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center font-bold">
                        <UserCircle size={24} className="opacity-50" />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900">{user.name}</div>
                        <div className="text-xs text-neutral-500">ID: {user.uuid.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-600 font-medium">
                    <div>{user.email}</div>
                    <div className="text-xs text-neutral-400">{user.phone || "No phone"}</div>
                  </td>
                  <td className="py-4 px-6 text-neutral-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right text-neutral-500 text-xs">
                    {user.role === 'OWNER' && <div>{user._count.listings} PGs</div>}
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
