"use client";
import { useState, useEffect } from "react";
import { 
  Users, Building2, MousePointerClick, RefreshCcw, Phone, LogIn, Trash2,
  Calendar, Clock, Eye, ArrowRight, CheckCircle2, ShieldAlert,
  ChevronDown, ChevronUp, Handshake, DoorOpen, Bed, Home, ShieldCheck,
  ExternalLink, Filter, MapPin
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
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "PARTNER" | "DIRECT">("ALL");
  const [expandedOwnerId, setExpandedOwnerId] = useState<number | null>(null);
  const [expandedTab, setExpandedTab] = useState<"tenants" | "listings">("tenants");

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

      {/* Role and Source Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200/80 w-fit shadow-2xs">
          {["OWNER", "TENANT"].map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); setExpandedOwnerId(null); }}
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

        {/* Source Filter for Owners */}
        {role === "OWNER" && (
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200/80 w-fit shadow-2xs text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-semibold">
              <Filter size={10} /> Source:
            </span>
            {(["ALL", "DIRECT", "PARTNER"] as const).map((sf) => (
              <button
                key={sf}
                onClick={() => setSourceFilter(sf)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  sourceFilter === sf
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {sf === "ALL" ? "All Owners" : sf === "DIRECT" ? "Direct (Self)" : "Partner Sourced"}
              </button>
            ))}
          </div>
        )}
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
                Neeche portal registered tenants ki list hai (who signed up on pgsathi to search PGs). Agar PG stay CRM tenants dekhne hain (Rooms, Beds, Rent, Police verification), toh Platform Tenants page dekhein.
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
              {role === "OWNER" ? "Registered PG Owners (SaaS Clients)" : "Registered Tenants (Portal Accounts)"}
            </h2>
            {role === "OWNER" && (
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Click on any owner or their tenant count to view their live CRM tenants, rooms, rent, and PGs.
              </p>
            )}
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone, partner code..."
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
                <th className="px-4 py-2 font-bold min-w-[240px]">{role === "OWNER" ? "Owner Details & Source" : "Tenant / User"}</th>
                {role === "OWNER" ? (
                  <>
                    <th className="px-4 py-2 font-bold text-center">PGs</th>
                    <th className="px-4 py-2 font-bold text-center">CRM Tenants</th>
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
              {data.owners
                .filter((o: any) => {
                  if (role !== "OWNER") return true;
                  if (sourceFilter === "PARTNER") return !!o.partner;
                  if (sourceFilter === "DIRECT") return !o.partner;
                  return true;
                })
                .map((o: any) => {
                const regTime = formatDateTime(o.createdAt);
                const isExpanded = expandedOwnerId === o.id;

                return (
                  <>
                  <tr 
                    key={o.id} 
                    className={`transition-colors group ${isExpanded ? "bg-violet-50/40" : "hover:bg-slate-50/70"}`}
                  >
                    {/* User / Owner Info */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {role === "OWNER" && (
                          <button
                            onClick={() => setExpandedOwnerId(isExpanded ? null : o.id)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-violet-700 hover:bg-violet-100/60 transition-colors shrink-0 cursor-pointer"
                            title={isExpanded ? "Collapse Details" : "Expand Tenants & PGs"}
                          >
                            {isExpanded ? <ChevronUp size={15} className="text-violet-700 font-bold" /> : <ChevronDown size={15} />}
                          </button>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0 border border-violet-200/60 shadow-2xs">
                          {o.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a href={`/dashboard/admin/users/${o.id}`} className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase block truncate">
                              {o.name}
                            </a>
                            {role === "OWNER" && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-200/70 text-neutral-600 uppercase">
                                PG Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 truncate mt-0.5">
                            {o.phone || "No phone"} · {o.email}
                          </div>
                          {/* SOURCED VIA PARTNER ATTRIBUTION - Clear distinction that this is an Owner referred by Partner */}
                          {o.partner ? (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 tracking-wider">
                                <Handshake size={10} className="text-amber-700 shrink-0" />
                                <span className="text-neutral-500 font-semibold uppercase text-[8px]">Sourced via:</span>
                                <a
                                  href={`/dashboard/admin/partners/${o.partner.id}`}
                                  className="font-black text-violet-700 hover:underline uppercase"
                                  onClick={(e) => e.stopPropagation()}
                                  title={`Partner: ${o.partner.name || o.partner.partnerCode}`}
                                >
                                  {o.partner.name ? `${o.partner.name.split(" ")[0]} (${o.partner.partnerCode})` : o.partner.partnerCode}
                                </a>
                              </span>
                            </div>
                          ) : role === "OWNER" ? (
                            <div className="text-[8px] font-semibold text-neutral-400 mt-0.5 tracking-wider uppercase">
                              Direct (Self-Registered)
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* OWNER COLUMNS */}
                    {role === "OWNER" ? (
                      <>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => {
                              setExpandedOwnerId(isExpanded && expandedTab === "listings" ? null : o.id);
                              setExpandedTab("listings");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 border border-violet-200/80 hover:bg-violet-100 text-xs font-black transition-all cursor-pointer shadow-2xs"
                            title="Click to view PG listings"
                          >
                            <Building2 size={12} />
                            <span>{o.pgCount}</span>
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => {
                              setExpandedOwnerId(isExpanded && expandedTab === "tenants" ? null : o.id);
                              setExpandedTab("tenants");
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shadow-2xs ${
                              o.tenantCount > 0
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title="Click to view tenant list & details"
                          >
                            <Users size={12} />
                            <span>{o.tenantCount}</span>
                            {isExpanded && expandedTab === "tenants" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        </td>
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
                          className="cursor-pointer text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-800 hover:bg-amber-500/20 transition-colors uppercase tracking-wider inline-flex items-center gap-1 active:scale-95 shadow-2xs"
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

                  {/* EXPANDABLE ROW FOR OWNER - Shows their CRM Tenants, PGs, and detailed breakdown */}
                  {isExpanded && role === "OWNER" && (
                    <tr className="bg-gradient-to-r from-violet-50/50 via-white to-slate-50/60 border-b border-violet-200/80">
                      <td colSpan={6} className="p-3 sm:p-5">
                        <div className="bg-white rounded-xl border border-violet-200 p-4 shadow-sm space-y-4">
                          {/* Expanded Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-black text-sm border border-violet-200">
                                {o.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                  <span>{o.name} &bull; Property & Tenant Details</span>
                                  <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase tracking-wider">
                                    {o.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  Phone: {o.phone || "—"} &bull; Email: {o.email} &bull; Registered: {regTime.date} ({regTime.relative})
                                </div>
                              </div>
                            </div>

                            {/* Sub-tabs toggle */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
                              <button
                                onClick={() => setExpandedTab("tenants")}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                                  expandedTab === "tenants" ? "bg-white text-violet-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <Users size={12} />
                                <span>CRM Tenants ({o.tenants?.length || 0})</span>
                              </button>
                              <button
                                onClick={() => setExpandedTab("listings")}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                                  expandedTab === "listings" ? "bg-white text-violet-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <Building2 size={12} />
                                <span>PG Listings ({o.listings?.length || 0})</span>
                              </button>
                            </div>
                          </div>

                          {/* Sub-tab 1: Tenants List */}
                          {expandedTab === "tenants" && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Users size={13} className="text-emerald-600" />
                                  <span>All Staying Tenants under {o.name} ({o.tenants?.length || 0})</span>
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Total Tenants: {o.tenantCount}
                                </span>
                              </div>

                              {o.tenants && o.tenants.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                                  <table className="w-full text-left text-xs min-w-[700px]">
                                    <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                      <tr>
                                        <th className="px-3.5 py-2 font-bold">Tenant Name & Contact</th>
                                        <th className="px-3.5 py-2 font-bold">PG Property</th>
                                        <th className="px-3.5 py-2 font-bold">Room & Bed</th>
                                        <th className="px-3.5 py-2 font-bold">Monthly Rent</th>
                                        <th className="px-3.5 py-2 font-bold">Check-in Date</th>
                                        <th className="px-3.5 py-2 font-bold">Police Verification</th>
                                        <th className="px-3.5 py-2 font-bold text-center">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {o.tenants.map((t: any) => (
                                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                          <td className="px-3.5 py-2.5">
                                            <div className="font-bold text-slate-900 text-xs uppercase">{t.name}</div>
                                            <div className="text-[10px] text-slate-400 font-semibold">{t.phone} {t.email ? `· ${t.email}` : ""}</div>
                                          </td>
                                          <td className="px-3.5 py-2.5 font-semibold text-slate-800 text-xs">
                                            {t.listing?.title || "PG Stay"}
                                          </td>
                                          <td className="px-3.5 py-2.5 text-xs font-bold text-violet-700 uppercase">
                                            {cleanRoomName(t.room?.name)} {t.bed?.name ? `· ${cleanBedName(t.bed.name)}` : ""}
                                          </td>
                                          <td className="px-3.5 py-2.5 font-black text-emerald-700 text-xs">
                                            ₹{t.monthlyRent?.toLocaleString("en-IN") || 0}/mo
                                          </td>
                                          <td className="px-3.5 py-2.5 text-[10px] text-slate-600 font-semibold whitespace-nowrap">
                                            {t.checkInDate ? new Date(t.checkInDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                          </td>
                                          <td className="px-3.5 py-2.5">
                                            <span className={`inline-flex items-center text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                              t.policeVerificationStatus === "VERIFIED"
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                : t.policeVerificationStatus === "PENDING"
                                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                                            }`}>
                                              {t.policeVerificationStatus || "NOT_SUBMITTED"}
                                            </span>
                                          </td>
                                          <td className="px-3.5 py-2.5 text-center">
                                            <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                              t.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"
                                            }`}>
                                              {t.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-6 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
                                  <Users size={22} className="mx-auto text-slate-300 mb-1.5" />
                                  <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">No CRM Tenants Registered Yet</div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">This PG owner has not added any tenants into their CRM dashboard yet.</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Sub-tab 2: Listings */}
                          {expandedTab === "listings" && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Building2 size={13} className="text-violet-600" />
                                  <span>PG Properties Listed by {o.name} ({o.listings?.length || 0})</span>
                                </h3>
                              </div>

                              {o.listings && o.listings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {o.listings.map((l: any) => (
                                    <div key={l.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-violet-300 transition-all shadow-2xs">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="font-bold text-xs text-slate-900 uppercase tracking-tight truncate flex-1">
                                          {l.title}
                                        </div>
                                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                          l.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                        }`}>
                                          {l.status}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                                        <MapPin size={11} className="text-violet-500 shrink-0" />
                                        <span>{l.address || l.city?.name || "Location not set"}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[9px] font-bold uppercase text-slate-600">
                                        <span>{l._count?.rooms || 0} Rooms</span>
                                        <span>&bull;</span>
                                        <span>{l._count?.pgTenants || 0} Tenants</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-6 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
                                  <Building2 size={22} className="mx-auto text-slate-300 mb-1.5" />
                                  <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">No PG Listings Found</div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">This owner has not created any PG listings yet.</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Expanded sub-footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 text-[10px] gap-2">
                            <div className="flex items-center gap-3 text-slate-500 font-semibold">
                              {o.partner ? (
                                <span className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-amber-900">
                                  <Handshake size={12} className="text-amber-700" />
                                  <span>Referred by Partner: <a href={`/dashboard/admin/partners/${o.partner.id}`} className="font-bold text-violet-700 hover:underline">{o.partner.name || o.partner.partnerCode} ({o.partner.partnerCode})</a></span>
                                </span>
                              ) : (
                                <span className="text-slate-400">Direct Registration &bull; Self-Onboarded</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/dashboard/admin/users/${o.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[10px] uppercase tracking-wider transition-colors shadow-2xs"
                              >
                                <span>Open Full Owner Page</span>
                                <ArrowRight size={11} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
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
          {data.owners
            .filter((o: any) => {
              if (role !== "OWNER") return true;
              if (sourceFilter === "PARTNER") return !!o.partner;
              if (sourceFilter === "DIRECT") return !o.partner;
              return true;
            })
            .map((o: any) => {
            const regTime = formatDateTime(o.createdAt);
            const isMobExpanded = expandedOwnerId === o.id;

            return (
              <div key={`mob-${o.id}`} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a href={`/dashboard/admin/users/${o.id}`} className="font-bold text-sm uppercase tracking-tight text-slate-900 hover:text-violet-700 transition-colors truncate block">
                        {o.name}
                      </a>
                      {role === "OWNER" && (
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 uppercase">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                      {o.phone || "No phone"} · {o.email}
                    </div>
                    {/* Clear Partner Attribution */}
                    {o.partner ? (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 tracking-wider">
                          <Handshake size={9} className="text-amber-700 shrink-0" />
                          <span className="text-neutral-500 font-semibold uppercase text-[7.5px]">Sourced via:</span>
                          <a
                            href={`/dashboard/admin/partners/${o.partner.id}`}
                            className="font-black text-violet-700 hover:underline uppercase"
                          >
                            {o.partner.name ? `${o.partner.name.split(" ")[0]} (${o.partner.partnerCode})` : o.partner.partnerCode}
                          </a>
                        </span>
                      </div>
                    ) : role === "OWNER" ? (
                      <div className="text-[8px] font-semibold text-neutral-400 mt-0.5 tracking-wider uppercase">
                        Direct (Self-Registered)
                      </div>
                    ) : null}
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
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100 text-center bg-slate-50/60 rounded-lg">
                      <button
                        onClick={() => {
                          setExpandedOwnerId(isMobExpanded && expandedTab === "listings" ? null : o.id);
                          setExpandedTab("listings");
                        }}
                        className="p-1 cursor-pointer hover:bg-slate-100 rounded"
                      >
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PGs</div>
                        <div className="text-xs font-bold text-violet-700">{o.pgCount}</div>
                      </button>
                      <button
                        onClick={() => {
                          setExpandedOwnerId(isMobExpanded && expandedTab === "tenants" ? null : o.id);
                          setExpandedTab("tenants");
                        }}
                        className="p-1 cursor-pointer hover:bg-slate-100 rounded border-x border-slate-200/80"
                      >
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tenants</div>
                        <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                          <span>{o.tenantCount}</span>
                          {isMobExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </div>
                      </button>
                      <div className="p-1">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Leads</div>
                        <div className="text-xs font-bold text-slate-800">{o.leadCount}</div>
                      </div>
                    </div>

                    {/* Mobile Expanded Tenant / Listing View */}
                    {isMobExpanded && (
                      <div className="bg-slate-50 border border-violet-200 rounded-lg p-3 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                            {expandedTab === "tenants" ? `CRM Tenants (${o.tenants?.length || 0})` : `PGs (${o.listings?.length || 0})`}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setExpandedTab("tenants")}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                expandedTab === "tenants" ? "bg-violet-600 text-white" : "bg-white text-slate-600 border"
                              }`}
                            >
                              Tenants
                            </button>
                            <button
                              onClick={() => setExpandedTab("listings")}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                expandedTab === "listings" ? "bg-violet-600 text-white" : "bg-white text-slate-600 border"
                              }`}
                            >
                              PGs
                            </button>
                          </div>
                        </div>

                        {expandedTab === "tenants" && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {o.tenants && o.tenants.length > 0 ? (
                              o.tenants.map((t: any) => (
                                <div key={t.id} className="p-2 bg-white rounded border border-slate-200 text-[10px]">
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>{t.name}</span>
                                    <span className="text-emerald-700 font-black">₹{t.monthlyRent}/mo</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-0.5">
                                    {cleanRoomName(t.room?.name)} &bull; {t.listing?.title || "PG"}
                                  </div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">
                                    Phone: {t.phone} &bull; Status: {t.status}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-3 text-[10px] text-slate-400">No tenants added yet</div>
                            )}
                          </div>
                        )}

                        {expandedTab === "listings" && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {o.listings && o.listings.length > 0 ? (
                              o.listings.map((l: any) => (
                                <div key={l.id} className="p-2 bg-white rounded border border-slate-200 text-[10px]">
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span className="truncate">{l.title}</span>
                                    <span className="text-[8px] px-1 rounded bg-violet-50 text-violet-800">{l.status}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">
                                    {l.city?.name || "City"} &bull; {l._count?.rooms || 0} Rooms
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-3 text-[10px] text-slate-400">No PGs added yet</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
