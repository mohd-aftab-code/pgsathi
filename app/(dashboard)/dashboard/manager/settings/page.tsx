import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireManagerAccess } from "@/lib/manager-auth";
import { User, Phone, Mail, Settings, ShieldCheck } from "lucide-react";
import EditEmailButton from "@/components/dashboard/EditEmailButton";
import { ModuleToggle } from "@/components/manage/ModuleToggle";
import LogoutButton from "@/components/common/LogoutButton";

export const metadata = { title: "Settings - Manager Dashboard" };

export default async function ManagerSettingsPage() {
  const { isManager, isOwner, managerRole } = await requireManagerAccess();
  const session = await auth();

  let name: string | undefined;
  let email: string | undefined;
  let phone: string | null | undefined;
  let messMenuEnabled = false;
  let expensesEnabled = false;

  if (isManager) {
    // Staff logins are PgTeamMember rows, not User rows — session.user.id is "manager:<memberId>".
    const memberId = parseInt(session!.user.id.replace("manager:", ""));
    const member = await db.pgTeamMember.findUnique({ where: { id: memberId } });
    name = member?.name;
    email = member?.email;
    phone = null;
  } else {
    const user = await db.user.findUnique({ where: { id: Number(session!.user.id) } });
    name = user?.name;
    email = user?.email ?? undefined;
    phone = user?.phone;
    messMenuEnabled = user?.messMenuEnabled ?? false;
    expensesEnabled = user?.expensesEnabled ?? false;
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-sm border border-neutral-200/60 p-4 sm:p-6 md:p-8">
      <div className="mb-6 lg:mb-8 border-b border-neutral-200/60 pb-5">
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2 uppercase">
          <Settings className="text-violet-600" /> My Profile
        </h1>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Manage your basic details and account preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-white/40 p-4 sm:p-6 rounded-2xl border border-neutral-200/40 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-violet-100/80 text-violet-700 rounded-full flex items-center justify-center text-2xl font-black shrink-0 shadow-sm border border-violet-200/60">
              {name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">{name}</h2>
              <div className="text-[9px] font-bold text-violet-600 bg-violet-50/80 border border-violet-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1 uppercase tracking-wider">
                {isOwner ? <User size={12} /> : <ShieldCheck size={12} />}
                {isOwner ? "Owner" : managerRole}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {phone && (
              <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-md rounded-xl border border-neutral-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-100/80 p-2 rounded-lg border border-neutral-200/40">
                    <Phone size={18} className="text-neutral-500" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Phone Number</div>
                    <div className="text-sm font-black text-neutral-900">+91 {phone}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-md rounded-xl border border-neutral-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-100/80 p-2 rounded-lg border border-neutral-200/40">
                  <Mail size={18} className="text-neutral-500" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Email Address</div>
                  <div className="text-sm font-black text-neutral-900">{email || "Not provided"}</div>
                </div>
              </div>
              {isOwner && <EditEmailButton currentEmail={email ?? ""} />}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider mb-1">Modules & Preferences</h3>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-4">Apne CRM ke optional modules on/off karein.</p>
            <div className="space-y-3">
              <ModuleToggle
                moduleKey="messMenuEnabled"
                title="Mess Menu"
                description="Weekly food menu module. Sirf tab on karein jab aapka PG khana serve karta ho."
                initialEnabled={messMenuEnabled}
              />
              <ModuleToggle
                moduleKey="expensesEnabled"
                title="Expenses"
                description="PG kharchon ka hisaab (Finance section). Zaroorat ho to on karein."
                initialEnabled={expensesEnabled}
              />
            </div>
          </div>
        )}

        <div className="bg-white/60 backdrop-blur-md border border-red-200/60 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2">Logout</h3>
          <div className="border-t border-red-200/40 pt-4 mt-2">
            <h3 className="text-[9px] font-bold text-neutral-800 uppercase tracking-wider mb-3">Sign out of your manager account</h3>
            <LogoutButton className="w-full flex justify-center py-3 bg-white border border-neutral-200/60 text-[10px] text-neutral-700 hover:bg-neutral-50 uppercase tracking-wider shadow-sm rounded-xl font-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
