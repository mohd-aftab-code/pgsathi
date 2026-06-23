import { BarChart3, Clock } from "lucide-react";

export const metadata = {
  title: "Reports - Admin",
};

export default function AdminReportsPage() {
  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-teal-950 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Analytics & Reports</h1>
        <p className="text-teal-200 relative z-10">Platform performance, revenue metrics, and user growth data.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col items-center justify-center p-20 text-center">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-500 shadow-inner">
          <BarChart3 size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-3">Reports Module Coming Soon</h2>
        <p className="text-neutral-500 max-w-md mx-auto mb-8">
          We are currently building the advanced reporting module which will include detailed charts, revenue exports, and conversion tracking.
        </p>
        
        <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 px-4 py-2 rounded-xl text-sm font-bold">
          <Clock size={16} /> Expected release in v2.0
        </div>
      </div>
    </div>
  );
}
