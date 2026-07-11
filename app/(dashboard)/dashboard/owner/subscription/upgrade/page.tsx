import Link from "next/link";
import { CheckCircle2, AlertCircle, Building2, ShieldCheck, Zap } from "lucide-react";
import { requireManagerAccess } from "@/lib/manager-auth";

export const metadata = { title: "Upgrade to Premium — PGSathi" };

export default async function UpgradePage() {
  // Try to get access info, but don't fail if we can't
  // Wait, requireManagerAccess redirects to this page if no access!
  // So we can't use requireManagerAccess here if it redirects to itself.
  // We need to use `auth()` and check directly.
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">Trial Expired or No Active Plan</h1>
        <p className="text-neutral-500 max-w-xl mx-auto text-lg">
          Your 15-day free trial of the CRM has ended. Upgrade to a premium plan to continue managing your PGs and unlocking lead phone numbers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm relative">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Basic Starter</h3>
          <p className="text-sm text-neutral-500 mb-6">For single PG owners wanting tenant leads.</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-neutral-900">₹499</span>
            <span className="text-neutral-500 font-medium">/mo</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3 text-sm text-neutral-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> Unlock all Lead Phone Numbers
            </li>
            <li className="flex gap-3 text-sm text-neutral-700">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" /> Limit: 1 PG Listing
            </li>
            <li className="flex gap-3 text-sm text-neutral-400">
              <AlertCircle size={18} className="shrink-0" /> No CRM Access (Rent/Expenses Locked)
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl font-bold bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition">
            Buy Basic
          </button>
        </div>

        {/* Pro CRM Plan */}
        <div className="bg-neutral-900 rounded-3xl p-8 shadow-xl relative overflow-hidden ring-2 ring-primary-500 ring-offset-2">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
            Recommended
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="text-primary-400" size={20} /> Pro CRM
          </h3>
          <p className="text-sm text-neutral-400 mb-6">Complete Management Software + Multi-PG</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">₹1499</span>
            <span className="text-neutral-500 font-medium">/mo</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3 text-sm text-neutral-200">
              <CheckCircle2 size={18} className="text-primary-400 shrink-0" /> <strong className="text-white">Unlimited</strong> Unmasked Leads
            </li>
            <li className="flex gap-3 text-sm text-neutral-200">
              <CheckCircle2 size={18} className="text-primary-400 shrink-0" /> <strong className="text-white">Unlimited</strong> PG Listings
            </li>
            <li className="flex gap-3 text-sm text-neutral-200">
              <CheckCircle2 size={18} className="text-primary-400 shrink-0" /> Automated WhatsApp Rent Reminders
            </li>
            <li className="flex gap-3 text-sm text-neutral-200">
              <CheckCircle2 size={18} className="text-primary-400 shrink-0" /> Full CRM: Complaints, Expenses, Staff
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 transition shadow-lg shadow-primary-500/25">
            Upgrade to Pro CRM
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-neutral-500">Need help or offline activation? <a href="#" className="font-semibold text-primary-600">Contact Support</a></p>
      </div>
    </div>
  );
}
