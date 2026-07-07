import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Settings - Admin",
};

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Global Settings</h1>
        <p className="text-neutral-300 relative z-10">Manage platform configurations and administrator preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">General Configuration</h2>
            <p className="text-neutral-500">Settings are currently locked for the beta version.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" /> Platform Fees
            </h3>
            <p className="text-sm text-neutral-500 mb-4">Set default commission percentages.</p>
            <input type="text" value="0%" disabled className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2" />
          </div>
          
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" /> Payment Gateway
            </h3>
            <p className="text-sm text-neutral-500 mb-4">Razorpay Environment</p>
            <select disabled className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2">
              <option>Simulated (Test Mode)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
