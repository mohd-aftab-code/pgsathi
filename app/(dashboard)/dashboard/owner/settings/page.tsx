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
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-neutral-200/60 pb-4">
        <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase">Account Settings</h1>
        <p className="text-xs font-medium text-neutral-500 mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <div className="bg-white/40 p-4 rounded-xl border border-neutral-200/60">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-200/60">
            <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-lg font-black shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 leading-none">{user?.name}</h2>
              <div className="text-[9px] font-black text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md inline-block mt-1.5 uppercase tracking-wider shadow-sm">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-neutral-200/60 shadow-sm hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-violet-400" />
                <div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Phone Number</div>
                  <div className="text-sm font-black text-neutral-900 mt-0.5">+91 {user?.phone}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-neutral-200/60 shadow-sm hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-violet-400" />
                <div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Email Address</div>
                  <div className="text-sm font-black text-neutral-900 mt-0.5">{user?.email || "Not provided"}</div>
                </div>
              </div>
              <EditEmailButton currentEmail={user?.email ?? ""} />
            </div>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100/60 rounded-xl p-4 sm:p-5 mt-2">
          <h3 className="text-sm font-black text-rose-700 mb-1 uppercase tracking-wider">Danger Zone</h3>
          <p className="text-xs font-medium text-rose-600/70 mb-4 max-w-lg">
            Account deletion involves your listings, tenants, and billing history — our team handles this manually to make sure nothing is lost by mistake.
          </p>
          <Link
            href="/contact"
            className="inline-block px-4 py-2 bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-rose-200 transition-colors shadow-sm"
          >
            Request Account Deletion
          </Link>
          <div className="border-t border-rose-200/60 pt-4 mt-4">
            <h3 className="text-xs font-bold text-neutral-800 mb-2 uppercase tracking-wider">Or simply sign out</h3>
            <LogoutButton className="w-full flex justify-center py-2.5 bg-neutral-100/80 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/60 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
