"use client";
import { useState, useEffect } from "react";
import { Users, UserCheck, UserMinus, Clock, RefreshCcw, Search, Phone } from "lucide-react";
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Total Tenants", value: data.stats.totalTenants, icon: Users, color: "text-violet-600", bg: "bg-violet-50/80 border-violet-200/60" },
          { label: "Active Tenants", value: data.stats.activeTenants, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200/60" },
          { label: "Checking Out", value: data.stats.checkingOut, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-200/60" },
          { label: "Inactive/Evicted", value: data.stats.inactiveTenants, icon: UserMinus, color: "text-red-600", bg: "bg-red-50/80 border-red-200/60" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-neutral-200/60 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 ${s.bg}`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight uppercase leading-none">{s.value}</div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider truncate mt-1">{s.label}</div>
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
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {data.tenants.map((t: any) => (
            <div key={`mob-${t.id}`} className="bg-white/80 backdrop-blur-md border border-neutral-200/70 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm uppercase tracking-tight text-neutral-900 truncate">{t.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                    {t.phone} {t.email ? `· ${t.email}` : ""}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {t.phone && (
                    <a
                      href={`tel:${t.phone}`}
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition-colors"
                      title="Call Tenant"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  {t.status === "ACTIVE" && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase shadow-2xs">
                      Active
                    </span>
                  )}
                  {t.status === "CHECKING_OUT" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-800 border border-amber-200 text-[9px] font-black uppercase shadow-2xs">
                      Checking Out
                    </span>
                  )}
                  {(t.status === "INACTIVE" || t.status === "EVICTED") && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black uppercase shadow-2xs">
                      {t.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-neutral-100 text-center bg-neutral-50/50 rounded-xl">
                <div className="truncate px-1">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Rent</div>
                  <div className="text-xs font-black text-emerald-700">₹{t.monthlyRent || 0}</div>
                </div>
                <div className="border-l border-neutral-200/60 truncate px-1">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">PG</div>
                  <div className="text-xs font-black text-neutral-800 truncate">{t.listing?.title || "N/A"}</div>
                </div>
                <div className="border-l border-neutral-200/60 truncate px-1">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Owner</div>
                  <a href={`/dashboard/admin/users/${t.owner?.id}`} className="text-xs font-black text-violet-700 truncate block">
                    {t.owner?.name || "N/A"}
                  </a>
                </div>
              </div>

              {t.checkInDate && (
                <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                  Joined: {new Date(t.checkInDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          ))}
          {data.tenants.length === 0 && (
            <div className="text-center p-8 text-neutral-500 text-xs bg-white/40 rounded-2xl border border-neutral-100">
              No tenants found.
            </div>
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
