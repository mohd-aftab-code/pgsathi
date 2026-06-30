import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { User, Phone, Mail, Settings } from "lucide-react";

export default async function OwnerSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
        <p className="text-neutral-500">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <div className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-1">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Phone Number</div>
                  <div className="text-sm font-bold text-neutral-900">+91 {user?.phone}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-neutral-400" />
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Email Address</div>
                  <div className="text-sm font-bold text-neutral-900">{user?.email || "Not provided"}</div>
                </div>
              </div>
              <button className="text-sm font-bold text-primary-600 hover:underline cursor-pointer">
                {user?.email ? "Edit" : "Add"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-red-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
