"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Users, Building2, MousePointerClick, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  async function fetchData(currentPage = page, currentQuery = query) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/overview?page=${currentPage}&query=${encodeURIComponent(currentQuery)}`);
      const d = await res.json();
      if (d.success) setData(d.data);
      else toast.error(d.message || "Failed to load data");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(page, query); }, [page, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  async function handleAction(userId: number, action: string, days?: number, force = false) {
    if (!force && !confirm(`Are you sure you want to perform: ${action}?`)) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, days, planId: 1, force })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        fetchData();
        return;
      }

      // Deleting someone with payment history destroys financial records, so the
      // API refuses once and asks again rather than doing it on the first click.
      if (d.requiresForce) {
        if (confirm(`${d.message}\n\nDelete permanently?`)) {
          await handleAction(userId, action, days, true);
        }
        return;
      }

      toast.error(d.message);
    } catch {
      toast.error("Request failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const handleImpersonate = async (userId: number, userName: string) => {
    if (!confirm(`Login as "${userName}"?\n\nThis will open their Owner Dashboard in a new tab. You can close it to return to your Admin panel.`)) return;
    
    const toastId = toast.loading(`Setting up session for ${userName}...`);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const d = await res.json();
      if (d.success && d.token) {
        toast.success(`Opening ${userName}'s dashboard...`, { id: toastId });
        // Open the impersonate-session page which will create a real session
        window.open(
          `/dashboard/admin/impersonate-session?token=${encodeURIComponent(d.token)}`,
          "_blank"
        );
      } else {
        toast.error(d.message || "Failed to generate token", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading master dashboard...</div>;
  }
  
  if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={22} />
              <h1 className="text-2xl font-extrabold">SaaS Client Management</h1>
            </div>
            <p className="text-neutral-300 text-sm">Manage PG owner trials, active subscriptions, and impersonate accounts for support.</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors shrink-0"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
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
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Registered PG Owners (Clients)</h2>
            <p className="text-sm text-neutral-500">Manage trials, subscriptions, and perform account impersonations.</p>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email..."
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 cursor-pointer">
              Search
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto hidden md:block">
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
                    <a href={`/dashboard/admin/users/${o.id}`} className="font-bold text-neutral-900 hover:text-violet-700 transition-colors">
                      {o.name}
                    </a>
                    <div className="text-xs text-neutral-500">{o.phone || "No phone"} · {o.email}</div>
                    {/* Partner-sourced owners carry a commission on every payment —
                        the admin needs to see that before touching their plan. */}
                    {o.partner && (
                      <a
                        href={`/dashboard/admin/partners/${o.partner.id}`}
                        className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 tracking-wide"
                      >
                        Partner · {o.partner.partnerCode}
                      </a>
                    )}
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
                        onClick={() => handleImpersonate(o.id, o.name)}
                        className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition"
                      >
                        Login As
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "extend_trial", 7)} 
                        className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                      >
                        +7D Trial
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "activate_plan")} 
                        className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        Activate Pro
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "delete")} 
                        className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
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

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 p-3 md:hidden">
          {data.owners.map((o: any) => (
            <div key={`mob-${o.id}`} className="bg-white border border-neutral-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neutral-900 truncate">{o.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{o.phone || "No phone"} · {o.email}</div>
                  {o.partner && (
                    <a
                      href={`/dashboard/admin/partners/${o.partner.id}`}
                      className="inline-block mt-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-violet-100 text-violet-700 tracking-wide"
                    >
                      Partner · {o.partner.partnerCode}
                    </a>
                  )}
                </div>
                <div className="shrink-0">
                  {o.status === "FREE_TRIAL" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      Trial
                    </span>
                  )}
                  {o.status === "PREMIUM" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      Pro
                    </span>
                  )}
                  {o.status === "EXPIRED" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800">
                      Expired
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-50 text-center">
                <div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">PGs</div>
                  <div className="text-xs font-bold text-neutral-700">{o.pgCount}</div>
                </div>
                <div className="border-l border-neutral-100">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Tenants</div>
                  <div className="text-xs font-bold text-neutral-700">{o.tenantCount}</div>
                </div>
                <div className="border-l border-neutral-100">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase">Leads</div>
                  <div className="text-xs font-bold text-neutral-700">{o.leadCount}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <button 
                  onClick={() => handleImpersonate(o.id, o.name)}
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-bold px-1.5 py-1.5 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition text-center"
                >
                  Login
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "extend_trial", 7)} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-bold px-1.5 py-1.5 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition text-center"
                >
                  +7D
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "activate_plan")} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-bold px-1.5 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition text-center"
                >
                  Pro
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "delete")} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-bold px-1.5 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition text-center"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
          {data.owners.length === 0 && (
            <div className="text-center text-neutral-500 py-6">No PG owners found.</div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Showing page <span className="font-bold">{data.pagination.currentPage}</span> of <span className="font-bold">{data.pagination.totalPages}</span> (Total: {data.pagination.totalCount})
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.pagination.currentPage === 1}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={data.pagination.currentPage === data.pagination.totalPages}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
