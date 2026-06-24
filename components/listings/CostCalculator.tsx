"use client";

import { CheckCircle2, Calculator } from "lucide-react";

interface CostProps {
  rent: number;
  deposit: number | null;
  electricity: number | null;
  maintenance: number | null;
  food: number | null;
  setupFee: number | null;
}

export default function CostCalculator({ rent, deposit, electricity, maintenance, food, setupFee }: CostProps) {
  const depositAmt = deposit || rent; // default to 1 month rent
  const total = rent + depositAmt + (electricity || 0) + (maintenance || 0) + (food || 0) + (setupFee || 0);

  return (
    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 mt-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-neutral-900 font-bold">
        <Calculator size={20} className="text-primary-600" />
        <h3 className="text-lg">First-Month Cost Calculator</h3>
      </div>
      
      <div className="space-y-3 mb-4 text-sm">
        <div className="flex justify-between items-center text-neutral-700">
          <span>First Month Rent</span>
          <span className="font-semibold">₹{rent}</span>
        </div>
        <div className="flex justify-between items-center text-neutral-700">
          <span>Security Deposit (Refundable)</span>
          <span className="font-semibold">₹{depositAmt}</span>
        </div>
        {maintenance ? (
          <div className="flex justify-between items-center text-neutral-700">
            <span>Maintenance</span>
            <span className="font-semibold">₹{maintenance}</span>
          </div>
        ) : null}
        {electricity ? (
          <div className="flex justify-between items-center text-neutral-700">
            <span>Electricity (Est.)</span>
            <span className="font-semibold">₹{electricity}</span>
          </div>
        ) : null}
        {food ? (
          <div className="flex justify-between items-center text-neutral-700">
            <span>Food / Mess</span>
            <span className="font-semibold">₹{food}</span>
          </div>
        ) : null}
        {setupFee ? (
          <div className="flex justify-between items-center text-neutral-700">
            <span>One-time Setup Fee</span>
            <span className="font-semibold">₹{setupFee}</span>
          </div>
        ) : null}
      </div>

      <div className="pt-4 border-t border-neutral-200 flex justify-between items-end">
        <div>
          <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Total to Move-in</div>
          <div className="text-3xl font-black text-neutral-900">₹{total}</div>
        </div>
        <div className="text-green-600 flex items-center gap-1 text-sm font-medium bg-green-50 px-2 py-1 rounded">
          <CheckCircle2 size={14} /> Zero Brokerage
        </div>
      </div>
    </div>
  );
}
