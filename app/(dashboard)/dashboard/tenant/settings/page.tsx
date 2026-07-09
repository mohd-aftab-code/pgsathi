import { auth } from "@/lib/auth";
import { Settings } from "lucide-react";

export const metadata = { title: "Settings - Tenant Dashboard" };

export default async function TenantSettingsPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-6 lg:mb-8 border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          <Settings className="text-violet-600" /> Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your account preferences and security.</p>
      </div>
      
      <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings size={32} className="text-neutral-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Settings Coming Soon</h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          We are currently building this section. You'll soon be able to manage your notifications, security preferences, and account details here.
        </p>
      </div>
    </div>
  );
}
