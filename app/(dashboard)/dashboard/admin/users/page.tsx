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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">SaaS Client Management</h1>
          </div>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Manage PG owner trials, active subscriptions, and impersonate accounts.</p>
        </div>
        <button
          onClick={() => fetchData()}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase tracking-wider font-black transition-colors shrink-0 shadow-sm cursor-pointer"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total PG Owners", value: data.stats.totalUsers, icon: Users, color: "text-violet-600", bg: "bg-violet-50/80 border-violet-200/60" },
          { label: "Active PG Listings", value: data.stats.totalListings, icon: Building2, color: "text-blue-600", bg: "bg-blue-50/80 border-blue-200/60" },
          { label: "Active Tenants (CRM)", value: data.stats.totalTenants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200/60" },
          { label: "Total Platform Leads", value: data.stats.totalLeads, icon: MousePointerClick, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-200/60" },
        ].map((s, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900 tracking-tight uppercase">{s.value}</div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Owners Table */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">Registered Owners</h2>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email..."
              className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-xl text-[10px] font-bold uppercase tracking-wider w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
            <button type="submit" className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] uppercase tracking-wider font-black hover:bg-neutral-800 cursor-pointer shadow-sm">
              Search
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
              <tr>
                <th className="px-4 py-2 font-bold">Owner</th>
                <th className="px-4 py-2 font-bold text-center">PGs</th>
                <th className="px-4 py-2 font-bold text-center">Tenants</th>
                <th className="px-4 py-2 font-bold text-center">Leads</th>
                <th className="px-4 py-2 font-bold">SaaS Status</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
              {data.owners.map((o: any) => (
                <tr key={o.id} className="hover:bg-white/80 transition-colors group">
                  <td className="px-4 py-2">
                    <a href={`/dashboard/admin/users/${o.id}`} className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase">
                      {o.name}
                    </a>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{o.phone || "No phone"} · {o.email}</div>
                    {o.partner && (
                      <a
                        href={`/dashboard/admin/partners/${o.partner.id}`}
                        className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-100/80 border border-violet-200/60 shadow-sm text-violet-700 hover:bg-violet-200 transition-colors tracking-wider uppercase"
                      >
                        Partner · {o.partner.partnerCode}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-black text-neutral-700">{o.pgCount}</td>
                  <td className="px-4 py-2 text-center font-black text-neutral-700">{o.tenantCount}</td>
                  <td className="px-4 py-2 text-center font-black text-neutral-700">{o.leadCount}</td>
                  <td className="px-4 py-2">
                    {o.status === "FREE_TRIAL" && (
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-blue-100/80 text-blue-800 border border-blue-200/60 shadow-sm uppercase tracking-wider">
                          Active Trial
                        </span>
                        <div className="text-[9px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">Ends: {new Date(o.trialEndDate).toLocaleDateString()}</div>
                      </div>
                    )}
                    {o.status === "PREMIUM" && (
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 shadow-sm uppercase tracking-wider">
                          Premium Active
                        </span>
                        <div className="text-[9px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">Ends: {new Date(o.subscriptionEnd).toLocaleDateString()}</div>
                      </div>
                    )}
                    {o.status === "EXPIRED" && (
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-red-100/80 text-red-800 border border-red-200/60 shadow-sm uppercase tracking-wider">
                          Trial Expired
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleImpersonate(o.id, o.name)}
                        className="cursor-pointer text-[9px] font-black px-2 py-1.5 rounded-xl bg-orange-100/80 border border-orange-200/60 shadow-sm text-orange-700 hover:bg-orange-200 transition-colors uppercase tracking-wider"
                      >
                        Login As
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "extend_trial", 7)} 
                        className="cursor-pointer text-[9px] font-black px-2 py-1.5 rounded-xl bg-white/60 border border-neutral-200/60 shadow-sm text-neutral-700 hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                      >
                        +7D
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "activate_plan")} 
                        className="cursor-pointer text-[9px] font-black px-2 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-colors uppercase tracking-wider"
                      >
                        Pro
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "delete")} 
                        className="cursor-pointer text-[9px] font-black px-2 py-1.5 rounded-xl bg-red-100/80 border border-red-200/60 shadow-sm text-red-700 hover:bg-red-200 transition-colors uppercase tracking-wider"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.owners.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-500 text-xs">No PG owners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 p-3 md:hidden">
          {data.owners.map((o: any) => (
            <div key={`mob-${o.id}`} className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate">{o.name}</div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider truncate">{o.phone || "No phone"} · {o.email}</div>
                  {o.partner && (
                    <a
                      href={`/dashboard/admin/partners/${o.partner.id}`}
                      className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-100/80 border border-violet-200/60 shadow-sm text-violet-700 uppercase tracking-wider"
                    >
                      Partner · {o.partner.partnerCode}
                    </a>
                  )}
                </div>
                <div className="shrink-0">
                  {o.status === "FREE_TRIAL" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100/80 border border-blue-200/60 shadow-sm text-blue-800 uppercase tracking-wider">
                      Trial
                    </span>
                  )}
                  {o.status === "PREMIUM" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100/80 border border-emerald-200/60 shadow-sm text-emerald-800 uppercase tracking-wider">
                      Pro
                    </span>
                  )}
                  {o.status === "EXPIRED" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100/80 border border-red-200/60 shadow-sm text-red-800 uppercase tracking-wider">
                      Expired
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 py-2 border-y border-neutral-200/60 text-center">
                <div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">PGs</div>
                  <div className="text-xs font-black text-neutral-700">{o.pgCount}</div>
                </div>
                <div className="border-l border-neutral-200/60">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tenants</div>
                  <div className="text-xs font-black text-neutral-700">{o.tenantCount}</div>
                </div>
                <div className="border-l border-neutral-200/60">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Leads</div>
                  <div className="text-xs font-black text-neutral-700">{o.leadCount}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <button 
                  onClick={() => handleImpersonate(o.id, o.name)}
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-black px-1.5 py-2 rounded-xl bg-orange-100/80 border border-orange-200/60 shadow-sm text-orange-700 hover:bg-orange-200 transition-colors uppercase tracking-wider text-center"
                >
                  Login
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "extend_trial", 7)} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-black px-1.5 py-2 rounded-xl bg-white/60 border border-neutral-200/60 shadow-sm text-neutral-700 hover:bg-neutral-100 transition-colors uppercase tracking-wider text-center"
                >
                  +7D
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "activate_plan")} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-black px-1.5 py-2 rounded-xl bg-violet-600 text-white shadow-sm hover:bg-violet-700 transition-colors uppercase tracking-wider text-center"
                >
                  Pro
                </button>
                <button 
                  disabled={processing}
                  onClick={() => handleAction(o.id, "delete")} 
                  className="cursor-pointer flex-1 min-w-[70px] text-[10px] font-black px-1.5 py-2 rounded-xl bg-red-100/80 border border-red-200/60 shadow-sm text-red-700 hover:bg-red-200 transition-colors uppercase tracking-wider text-center"
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
          <div className="px-4 py-3 border-t border-neutral-200/60 bg-white/40 flex items-center justify-between">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Showing <span className="font-black text-neutral-600">{data.pagination.currentPage}</span> of <span className="font-black text-neutral-600">{data.pagination.totalPages}</span> (Total: {data.pagination.totalCount})
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.pagination.currentPage === 1}
                className="px-2.5 py-1.5 border border-neutral-200/60 shadow-sm rounded-xl text-[10px] font-black text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={data.pagination.currentPage === data.pagination.totalPages}
                className="px-2.5 py-1.5 border border-neutral-200/60 shadow-sm rounded-xl text-[10px] font-black text-neutral-600 hover:text-violet-700 bg-white/60 backdrop-blur-md hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-colors"
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
