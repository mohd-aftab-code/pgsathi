"use client";
import { useState, useEffect } from "react";
import { Users, UserCheck, UserMinus, Clock, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminTenantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  async function fetchData(currentPage = page, currentQuery = query) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants?page=${currentPage}&query=${encodeURIComponent(currentQuery)}`);
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

  if (loading && !data) {
    return <div className="p-8 text-center text-neutral-500">Loading tenants...</div>;
  }
  
  if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Platform Tenants</h1>
          </div>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Manage and view all PG tenants across the platform.</p>
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
          { label: "Total Tenants", value: data.stats.totalTenants, icon: Users, color: "text-violet-600", bg: "bg-violet-50/80 border-violet-200/60" },
          { label: "Active Tenants", value: data.stats.activeTenants, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200/60" },
          { label: "Checking Out", value: data.stats.checkingOut, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-200/60" },
          { label: "Inactive/Evicted", value: data.stats.inactiveTenants, icon: UserMinus, color: "text-red-600", bg: "bg-red-50/80 border-red-200/60" },
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

      {/* Tenants Table */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">All Tenants</h2>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-xl text-[10px] font-bold uppercase tracking-wider w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
            <button type="submit" className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] uppercase tracking-wider font-black hover:bg-neutral-800 cursor-pointer shadow-sm">
              <Search size={12} className="inline mr-1" /> Search
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
              <tr>
                <th className="px-4 py-2 font-bold">Tenant Name</th>
                <th className="px-4 py-2 font-bold">Contact</th>
                <th className="px-4 py-2 font-bold">PG / Listing</th>
                <th className="px-4 py-2 font-bold">PG Owner</th>
                <th className="px-4 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
              {data.tenants.map((t: any) => (
                <tr key={t.id} className="hover:bg-white/80 transition-colors group">
                  <td className="px-4 py-2">
                    <div className="font-black text-neutral-900 tracking-tight uppercase">
                      {t.name}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Joined: {new Date(t.checkInDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-bold text-neutral-700 tracking-wider uppercase">{t.phone}</div>
                    {t.email && <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{t.email}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-black text-neutral-900 tracking-tight uppercase">{t.listing?.title || "N/A"}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Rent: ₹{t.monthlyRent}</div>
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/dashboard/admin/users/${t.owner?.id}`} className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase block">
                      {t.owner?.name || "N/A"}
                    </a>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{t.owner?.phone}</div>
                  </td>
                  <td className="px-4 py-2">
                    {t.status === "ACTIVE" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 shadow-sm uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    {t.status === "CHECKING_OUT" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-amber-100/80 text-amber-800 border border-amber-200/60 shadow-sm uppercase tracking-wider">
                        Checking Out
                      </span>
                    )}
                    {(t.status === "INACTIVE" || t.status === "EVICTED") && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-[9px] font-black bg-red-100/80 text-red-800 border border-red-200/60 shadow-sm uppercase tracking-wider">
                        {t.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {data.tenants.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-500 text-xs">No tenants found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-2 p-3 md:hidden">
          {data.tenants.map((t: any) => (
            <div key={`mob-${t.id}`} className="bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate">{t.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">{t.phone}</div>
                </div>
                <div>
                  {t.status === "ACTIVE" && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Active</span>}
                  {t.status === "CHECKING_OUT" && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">Checking Out</span>}
                  {(t.status === "INACTIVE" || t.status === "EVICTED") && <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase">{t.status}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100">
                <div>
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">PG</div>
                  <div className="text-[11px] font-black text-neutral-700 uppercase truncate">{t.listing?.title || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Owner</div>
                  <a href={`/dashboard/admin/users/${t.owner?.id}`} className="text-[11px] font-black text-violet-700 uppercase truncate block">
                    {t.owner?.name || "N/A"}
                  </a>
                </div>
              </div>
            </div>
          ))}
          {data.tenants.length === 0 && (
            <div className="text-center p-4 text-neutral-500 text-xs">No tenants found.</div>
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {data.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200/60 shadow-sm text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Page {page} of {data.pagination.pages}
          </span>
          <button 
            disabled={page === data.pagination.pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200/60 shadow-sm text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
