"use client";
import { useState, useEffect } from "react";
import { 
  Users, Building2, MousePointerClick, RefreshCcw, Phone, LogIn, Trash2,
  Calendar, Clock, Eye, ArrowRight, CheckCircle2, ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";

function formatDateTime(dateStr: string | Date | null | undefined) {
  if (!dateStr) return { date: "N/A", time: "", relative: "", full: "N/A" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: "N/A", time: "", relative: "", full: "N/A" };
  
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  let relative = "Just now";
  if (diffSec >= 60 && diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
  else if (diffSec >= 3600 && diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
  else if (diffSec >= 86400 && diffSec < 2592000) relative = `${Math.floor(diffSec / 86400)}d ago`;
  else if (diffSec >= 2592000) relative = `${Math.floor(diffSec / 2592000)}mo ago`;

  return { date, time, relative, full: `${date}, ${time}` };
}

function cleanRoomName(name?: string | null) {
  if (!name) return "Room Assigned";
  const cleaned = name.replace(/^(room\s*)+/i, "").trim();
  return cleaned ? `Room ${cleaned}` : "Room Assigned";
}

function cleanBedName(name?: string | null) {
  if (!name) return "";
  const cleaned = name.replace(/^(bed\s*)+/i, "").trim();
  return cleaned ? `Bed ${cleaned}` : "Bed Assigned";
}

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState("OWNER");

  async function fetchData(currentPage = page, currentQuery = query, currentRole = role) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/overview?page=${currentPage}&query=${encodeURIComponent(currentQuery)}&role=${currentRole}`);
      const d = await res.json();
      if (d.success) setData(d.data);
      else toast.error(d.message || "Failed to load data");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(page, query, role); }, [page, query, role]);

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
    if (!confirm(`Login as "${userName}"?\n\nThis will open their dashboard session in a new tab. You can close it to return to your Admin panel.`)) return;
    
    const toastId = toast.loading(`Setting up session for ${userName}...`);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const d = await res.json();
      if (d.success && d.token) {
        toast.success(`Opening ${userName}'s session...`, { id: toastId });
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

  if (loading && !data) {
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
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
            Manage PG owner trials, active subscriptions, registered tenants, and impersonate accounts.
          </p>
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
          { label: "Total Owners", value: data.stats.totalUsers, icon: Users, color: "text-violet-600", bg: "bg-violet-50/80 border-violet-200/60" },
          { label: "Active Listings", value: data.stats.totalListings, icon: Building2, color: "text-blue-600", bg: "bg-blue-50/80 border-blue-200/60" },
          { label: "Tenants (CRM)", value: data.stats.totalTenants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200/60" },
          { label: "Platform Leads", value: data.stats.totalLeads, icon: MousePointerClick, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-200/60" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border shadow-2xs shrink-0 ${s.bg}`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200/80 w-fit shadow-2xs">
        {["OWNER", "TENANT"].map(r => (
          <button
            key={r}
            onClick={() => { setRole(r); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              role === r 
                ? "bg-violet-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {r === "OWNER" ? "PG Owners (SaaS)" : "Tenants (Portal Users)"}
          </button>
        ))}
      </div>

      {/* Helpful banner for Tenants tab */}
      {role === "TENANT" && (
        <div className="bg-gradient-to-r from-violet-50/90 to-blue-50/90 border border-violet-200/70 rounded-xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
              <Users size={15} />
            </div>
            <div>
              <div className="text-xs font-black text-neutral-900 uppercase tracking-tight">Portal Registered Tenants</div>
              <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                Neeche registered users ki list hai with registration Date & Time (kab join hue). Agar PG CRM tenants dekhne hain (Rooms, Beds, Rent, Police verification), toh Platform Tenants page dekhein.
              </div>
            </div>
          </div>
          <a
            href="/dashboard/admin/tenants"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider shrink-0 transition-all shadow-sm"
          >
            Open Platform Tenants <ArrowRight size={12} />
          </a>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {role === "OWNER" ? "Registered Owners (SaaS Clients)" : "Registered Tenants (Portal Accounts)"}
            </h2>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-2xs"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs uppercase tracking-wider font-bold hover:bg-slate-800 cursor-pointer shadow-xs">
              Search
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left min-w-[1050px]">
            <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
              <tr>
                <th className="px-4 py-2 font-bold min-w-[200px]">{role === "OWNER" ? "Owner Details" : "Tenant / User"}</th>
                {role === "OWNER" ? (
                  <>
                    <th className="px-4 py-2 font-bold text-center">PGs</th>
                    <th className="px-4 py-2 font-bold text-center">Tenants</th>
                    <th className="px-4 py-2 font-bold text-center">Leads</th>
                    <th className="px-4 py-2 font-bold">SaaS Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 font-bold min-w-[190px]">Registered Date & Time</th>
                    <th className="px-4 py-2 font-bold min-w-[190px]">Current PG Stay</th>
                    <th className="px-4 py-2 font-bold text-center min-w-[150px]">Platform Activity</th>
                    <th className="px-4 py-2 font-bold text-center min-w-[90px]">Account</th>
                  </>
                )}
                <th className="px-4 py-2 font-bold text-right min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {data.owners.map((o: any) => {
                const regTime = formatDateTime(o.createdAt);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* User / Owner Info */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0 border border-violet-200/60 shadow-2xs">
                          {o.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <a href={`/dashboard/admin/users/${o.id}`} className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase block truncate">
                            {o.name}
                          </a>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 truncate mt-0.5">
                            {o.phone || "No phone"} · {o.email}
                          </div>
                          {o.partner && (
                            <a
                              href={`/dashboard/admin/partners/${o.partner.id}`}
                              className="inline-block mt-0.5 text-[8px] font-black px-1.5 py-0.2 rounded bg-violet-100/80 border border-violet-200/60 shadow-sm text-violet-700 hover:bg-violet-200 transition-colors tracking-wider uppercase"
                            >
                              Partner · {o.partner.partnerCode}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* OWNER COLUMNS */}
                    {role === "OWNER" ? (
                      <>
                        <td className="px-4 py-2.5 text-center font-black text-neutral-700">{o.pgCount}</td>
                        <td className="px-4 py-2.5 text-center font-black text-neutral-700">{o.tenantCount}</td>
                        <td className="px-4 py-2.5 text-center font-black text-neutral-700">{o.leadCount}</td>
                        <td className="px-4 py-2.5">
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
                      </>
                    ) : (
                      /* TENANT COLUMNS */
                      <>
                        {/* Registered Date & Time - Clean single line date + time */}
                        <td className="px-4 py-2.5 whitespace-nowrap min-w-[190px]">
                          <div className="flex items-center gap-1.5 text-neutral-900 font-black text-[10px] tracking-tight">
                            <Calendar size={11} className="text-violet-600 shrink-0" />
                            <span>{regTime.date}</span>
                            <span className="text-neutral-500 font-semibold text-[9px]">· {regTime.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider pl-4">
                            <Clock size={10} className="text-neutral-400 shrink-0" />
                            <span>{regTime.relative}</span>
                          </div>
                        </td>

                        {/* Current PG Stay - No multiline breaking */}
                        <td className="px-4 py-2.5 whitespace-nowrap min-w-[190px]">
                          {o.currentStay ? (
                            <div className="min-w-0">
                              <div className="font-black text-neutral-900 tracking-tight text-[10px] uppercase truncate max-w-[180px]">
                                {o.currentStay.listing?.title || "PG Stay"}
                              </div>
                              <div className="text-[9px] text-violet-700 font-black tracking-wider uppercase mt-0.5">
                                {cleanRoomName(o.currentStay.room?.name)}
                                {o.currentStay.bed?.name ? ` · ${cleanBedName(o.currentStay.bed.name)}` : ""}
                              </div>
                              {o.currentStay.monthlyRent ? (
                                <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mt-0.2">
                                  Rent: ₹{o.currentStay.monthlyRent.toLocaleString("en-IN")}/mo
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-500 border border-neutral-200/60 uppercase tracking-wider whitespace-nowrap">
                              No Active Stay
                            </span>
                          )}
                        </td>

                        {/* Platform Activity */}
                        <td className="px-4 py-2.5 text-center whitespace-nowrap min-w-[150px]">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100/70 border border-neutral-200/60 text-[9px]">
                            <span className="text-amber-800 font-black">{o.leadCount || 0} Leads</span>
                            <span className="text-neutral-300">·</span>
                            <span className="text-blue-800 font-black">{o.visitCount || 0} Visits</span>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="px-4 py-2.5 text-center whitespace-nowrap min-w-[90px]">
                          {o.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
                              Banned
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap min-w-[160px]">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleImpersonate(o.id, o.name)}
                          className="cursor-pointer text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-800 hover:bg-amber-500/20 transition-colors uppercase tracking-wider inline-flex items-center gap-1 active:scale-95"
                          title="Login as User"
                        >
                          <LogIn size={10} /> Login As
                        </button>

                        {role === "OWNER" ? (
                          <>
                            <button 
                              disabled={processing}
                              onClick={() => handleAction(o.id, "extend_trial", 7)} 
                              className="cursor-pointer text-[10px] font-bold px-2 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-wider active:scale-95"
                              title="Extend Trial by 7 Days"
                            >
                              +7D
                            </button>
                            <button 
                              disabled={processing}
                              onClick={() => handleAction(o.id, "activate_plan")} 
                              className="cursor-pointer text-[10px] font-bold px-2 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow-2xs transition-colors uppercase tracking-wider active:scale-95"
                              title="Activate Pro Plan"
                            >
                              Pro
                            </button>
                          </>
                        ) : (
                          <a
                            href={`/dashboard/admin/users/${o.id}`}
                            className="cursor-pointer text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-violet-100/80 border border-violet-200/60 shadow-sm text-violet-700 hover:bg-violet-200 transition-colors uppercase tracking-wider inline-flex items-center gap-1 active:scale-95"
                            title="View Full Profile"
                          >
                            <Eye size={10} /> View
                          </a>
                        )}

                        <button 
                          disabled={processing}
                          onClick={() => handleAction(o.id, "delete")} 
                          className="cursor-pointer text-[9px] font-black p-1.5 rounded-xl bg-rose-100/80 border border-rose-200/60 shadow-sm text-rose-700 hover:bg-rose-200 transition-colors uppercase tracking-wider active:scale-95"
                          title="Delete User"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {data.owners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 text-xs">
                    No {role === "OWNER" ? "owners" : "tenants"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {data.owners.map((o: any) => {
            const regTime = formatDateTime(o.createdAt);
            return (
              <div key={`mob-${o.id}`} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <a href={`/dashboard/admin/users/${o.id}`} className="font-bold text-sm uppercase tracking-tight text-slate-900 hover:text-violet-700 transition-colors truncate block">
                      {o.name}
                    </a>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                      {o.phone || "No phone"} · {o.email}
                    </div>
                    {o.partner && (
                      <a
                        href={`/dashboard/admin/partners/${o.partner.id}`}
                        className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200/80 shadow-2xs text-violet-700 uppercase tracking-wider"
                      >
                        Partner · {o.partner.partnerCode}
                      </a>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {o.phone && (
                      <a
                        href={`tel:${o.phone}`}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition-colors"
                        title="Call User"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                    {role === "OWNER" ? (
                      <>
                        {o.status === "FREE_TRIAL" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 border border-blue-200/80 shadow-2xs text-blue-700 uppercase tracking-wider">
                            Trial
                          </span>
                        )}
                        {o.status === "PREMIUM" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 border border-emerald-200/80 shadow-2xs text-emerald-700 uppercase tracking-wider">
                            Pro
                          </span>
                        )}
                        {o.status === "EXPIRED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 border border-rose-200/80 shadow-2xs text-rose-700 uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        o.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-rose-50 text-rose-700 border border-rose-200/80"
                      }`}>
                        {o.isActive ? "Active" : "Banned"}
                      </span>
                    )}
                  </div>
                </div>

                {role === "OWNER" ? (
                  <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100 text-center bg-slate-50/60 rounded-lg">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PGs</div>
                      <div className="text-xs font-bold text-slate-800">{o.pgCount}</div>
                    </div>
                    <div className="border-l border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tenants</div>
                      <div className="text-xs font-bold text-slate-800">{o.tenantCount}</div>
                    </div>
                    <div className="border-l border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Leads</div>
                      <div className="text-xs font-bold text-slate-800">{o.leadCount}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 text-[10px]">
                        <Calendar size={11} className="text-violet-600" /> Registered:
                      </span>
                      <span className="font-bold text-slate-900 text-[11px]">{regTime.date} · {regTime.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Current Stay:</span>
                      <span className="font-bold text-slate-900 text-[11px]">
                        {o.currentStay ? `${o.currentStay.listing?.title || "PG"} (${cleanRoomName(o.currentStay.room?.name)})` : "No Active Stay"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Activity:</span>
                      <span className="font-bold text-slate-700 text-[11px]">
                        {o.leadCount || 0} Leads · {o.visitCount || 0} Visits
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className={`grid ${role === "OWNER" ? "grid-cols-4" : "grid-cols-3"} gap-1.5 pt-1`}>
                  <button 
                    onClick={() => handleImpersonate(o.id, o.name)}
                    className="cursor-pointer h-9 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95"
                  >
                    <LogIn size={11} /> Login
                  </button>

                  {role === "OWNER" ? (
                    <>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "extend_trial", 7)} 
                        className="cursor-pointer h-9 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                      >
                        +7D
                      </button>
                      <button 
                        disabled={processing}
                        onClick={() => handleAction(o.id, "activate_plan")} 
                        className="cursor-pointer h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-50"
                      >
                        Pro
                      </button>
                    </>
                  ) : (
                    <a
                      href={`/dashboard/admin/users/${o.id}`}
                      className="cursor-pointer h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                    >
                      <Eye size={11} /> Details
                    </a>
                  )}

                  <button 
                    disabled={processing}
                    onClick={() => handleAction(o.id, "delete")} 
                    className="cursor-pointer h-9 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 size={11} /> Del
                  </button>
                </div>
              </div>
            );
          })}
          {data.owners.length === 0 && (
            <div className="text-center p-8 text-slate-500 text-xs bg-white rounded-xl border border-slate-200/80">
              No {role === "OWNER" ? "owners" : "tenants"} found.
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Showing <span className="font-bold text-slate-700">{data.pagination.currentPage}</span> of <span className="font-bold text-slate-700">{data.pagination.totalPages}</span> (Total: {data.pagination.totalCount})
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.pagination.currentPage === 1}
                className="px-3 py-1.5 border border-slate-200/80 shadow-2xs rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={data.pagination.currentPage === data.pagination.totalPages}
                className="px-3 py-1.5 border border-slate-200/80 shadow-2xs rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-colors"
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
