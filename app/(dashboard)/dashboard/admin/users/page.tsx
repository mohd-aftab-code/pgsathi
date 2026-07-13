"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Users, Building2, MousePointerClick, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useSession, signIn } from "next-auth/react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const d = await res.json();
      if (d.success) setData(d.data);
      else toast.error(d.message || "Failed to load data");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAction(userId: number, action: string, days?: number) {
    if (!confirm(`Are you sure you want to perform: ${action}?`)) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, days, planId: 1 })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        fetchData();
      } else {
        toast.error(d.message);
      }
    } finally {
      setProcessing(false);
    }
  }

  const handleImpersonate = (userId: number) => {
    const pwd = prompt("Security Check: Enter your admin password to impersonate this user:");
    if (!pwd) return;
    
    toast.loading("Initiating impersonation session...");
    signIn("credentials", { 
      email: session?.user?.email, 
      password: pwd, 
      impersonateUserId: userId, 
      callbackUrl: "/dashboard" 
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading master dashboard...</div>;
  }
  
  if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={28} /> SaaS Client Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage PG owner trials, active subscriptions, and impersonate accounts for support.</p>
        </div>
        <button onClick={fetchData} className="btn-outline text-sm flex items-center gap-2">
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total PG Owners", value: data.stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active PG Listings", value: data.stats.totalListings, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Tenants (CRM)", value: data.stats.totalTenants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Platform Leads", value: data.stats.totalLeads, icon: MousePointerClick, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg}`}>
              <s.icon size={24} className={s.color} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-neutral-900">{s.value}</div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900">Registered PG Owners (Clients)</h2>
          <p className="text-sm text-neutral-500">Manage trials, subscriptions, and perform account impersonations.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold text-center">PGs</th>
                <th className="px-6 py-4 font-semibold text-center">Tenants</th>
                <th className="px-6 py-4 font-semibold text-center">Leads</th>
                <th className="px-6 py-4 font-semibold">SaaS Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.owners.map((o: any) => (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-900">{o.name}</div>
                    <div className="text-xs text-neutral-500">{o.phone || "No phone"} · {o.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-neutral-700">{o.pgCount}</td>
                  <td className="px-6 py-4 text-center font-semibold text-neutral-700">{o.tenantCount}</td>
                  <td className="px-6 py-4 text-center font-semibold text-neutral-700">{o.leadCount}</td>
                  <td className="px-6 py-4">
                    {o.status === "FREE_TRIAL" && (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Active Trial
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-1">Ends: {new Date(o.trialEndDate).toLocaleDateString()}</div>
                      </div>
                    )}
                    {o.status === "PREMIUM" && (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Premium Active
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-1">Ends: {new Date(o.subscriptionEnd).toLocaleDateString()}</div>
                      </div>
                    )}
                    {o.status === "EXPIRED" && (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          Trial Expired
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleImpersonate(o.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition"
                      >
                        Login As
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "extend_trial", 7)} 
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                      >
                        +7D Trial
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "activate_plan")} 
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        Activate Pro
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.owners.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No PG owners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
