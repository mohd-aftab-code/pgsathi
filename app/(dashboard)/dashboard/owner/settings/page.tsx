import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, Settings } from "lucide-react";
import EditEmailButton from "@/components/dashboard/EditEmailButton";
import LogoutButton from "@/components/common/LogoutButton";

export default async function OwnerSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
        <p className="text-neutral-500">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-neutral-50 p-4 sm:p-6 rounded-xl border border-neutral-100">
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
              <EditEmailButton currentEmail={user?.email ?? ""} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-red-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Account deletion involves your listings, tenants, and billing history — our team handles this manually to make sure nothing is lost by mistake.
          </p>
          <Link
            href="/contact"
            className="inline-block px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors mb-4"
          >
            Request Account Deletion
          </Link>
          <div className="border-t border-red-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Or simply sign out of your app</h3>
            <LogoutButton className="w-full flex justify-center py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
}
