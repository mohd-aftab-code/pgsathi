import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, Settings } from "lucide-react";
import EditEmailButton from "@/components/dashboard/EditEmailButton";
import LogoutButton from "@/components/common/LogoutButton";

export const metadata = { title: "Settings - Manager Dashboard" };

export default async function ManagerSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) }
  });

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-neutral-200 p-4 sm:p-6 md:p-8">
      <div className="mb-6 lg:mb-8 border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          <Settings className="text-teal-600" /> My Profile
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your basic details and account preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-neutral-50 p-4 sm:p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <div className="text-sm font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-1 capitalize">
                {user?.role?.toLowerCase()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <Phone size={18} className="text-neutral-500" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Phone Number</div>
                  <div className="text-sm font-bold text-neutral-900">+91 {user?.phone}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <Mail size={18} className="text-neutral-500" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Email Address</div>
                  <div className="text-sm font-bold text-neutral-900">{user?.email || "Not provided"}</div>
                </div>
              </div>
              <EditEmailButton currentEmail={user?.email ?? ""} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-red-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">Logout</h3>
          <div className="border-t border-red-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Sign out of your manager account</h3>
            <LogoutButton className="w-full flex justify-center py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
}
