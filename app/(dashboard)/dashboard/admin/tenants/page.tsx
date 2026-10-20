"use client";
import { useState, useEffect } from "react";
import { 
  Users, UserCheck, UserMinus, Clock, RefreshCcw, Search, Phone, 
  Mail, Building2, Bed, DoorOpen, ShieldCheck, ShieldAlert, FileText, 
  Calendar, MessageCircle, X, ExternalLink, Eye, ArrowRight, User, Home, AlertCircle
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

export default function AdminTenantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  async function fetchData(currentPage = page, currentQuery = query, currentStatus = statusFilter) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants?page=${currentPage}&query=${encodeURIComponent(currentQuery)}&status=${currentStatus}`);
      const d = await res.json();
      if (d.success) setData(d.data);
      else toast.error(d.message || "Failed to load data");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchData(page, query, statusFilter); 
  }, [page, query, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-neutral-500">Loading platform tenants...</div>;
  }
  
  if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Platform Tenants (CRM & Details)</h1>
          </div>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
            Manage and view all PG tenants across properties with room, rent, check-in timestamps, and full profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/dashboard/admin/users?role=TENANT"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[10px] uppercase tracking-wider font-black transition-colors shrink-0 shadow-2xs"
          >
            <Users size={12} /> Registered Portal Users ({data.stats?.totalRegisteredUsers || 0})
          </a>
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 h-8 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase tracking-wider font-black transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <RefreshCcw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Crisp labels that never truncate */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label: "CRM Tenants", value: data.stats.totalTenants, icon: Users, color: "text-violet-600", bg: "bg-violet-50/80 border-violet-200/60" },
          { label: "Active in PGs", value: data.stats.activeTenants, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200/60" },
          { label: "Checking Out", value: data.stats.checkingOut, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-200/60" },
          { label: "Past / Evicted", value: data.stats.inactiveTenants, icon: UserMinus, color: "text-rose-600", bg: "bg-rose-50/80 border-rose-200/60" },
          { label: "Portal Users", value: data.stats.totalRegisteredUsers, icon: Home, color: "text-blue-600", bg: "bg-blue-50/80 border-blue-200/60" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200/60 shadow-2xs flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 ${s.bg}`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight uppercase leading-none">{s.value}</div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1 whitespace-nowrap">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 w-fit shadow-2xs">
        {[
          { id: "ALL", label: "All Tenants" },
          { id: "ACTIVE", label: "Active" },
          { id: "CHECKING_OUT", label: "Checking Out" },
          { id: "INACTIVE_OR_EVICTED", label: "Past / Evicted" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => { setStatusFilter(f.id); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === f.id
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tenants Table Container */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">
              Platform Tenants ({data.pagination?.total || 0})
            </h2>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, email, Aadhaar..."
              className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-neutral-200/60 rounded-xl text-[10px] font-bold uppercase tracking-wider w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
            <button type="submit" className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] uppercase tracking-wider font-black hover:bg-neutral-800 cursor-pointer shadow-sm">
              <Search size={12} className="inline mr-1" /> Search
            </button>
          </form>
        </div>
        
        {/* Desktop Table View - Wide enough so columns breathe */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-white/40 text-neutral-400 text-[9px] uppercase tracking-wider border-b border-neutral-200/60">
              <tr>
                <th className="px-4 py-2 font-bold min-w-[200px]">Tenant Name</th>
                <th className="px-4 py-2 font-bold min-w-[180px]">Contact & Identity</th>
                <th className="px-4 py-2 font-bold min-w-[190px]">PG Stay & Room</th>
                <th className="px-4 py-2 font-bold min-w-[210px]">Check-In & CRM Dates</th>
                <th className="px-4 py-2 font-bold min-w-[150px]">PG Owner</th>
                <th className="px-4 py-2 font-bold text-center min-w-[110px]">Status</th>
                <th className="px-4 py-2 font-bold text-right min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 text-[11px] bg-white/60">
              {data.tenants.map((t: any) => {
                const checkIn = formatDateTime(t.checkInDate);
                const created = formatDateTime(t.createdAt);
                return (
                  <tr key={t.id} className="hover:bg-white/80 transition-colors group">
                    {/* Tenant Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200 shadow-2xs">
                          {t.name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedTenant(t)}
                            className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase block text-left truncate cursor-pointer"
                          >
                            {t.name}
                          </button>
                          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                            {t.gender || "MALE"} · {t.occupation || "Tenant"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Identity */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-neutral-800 tracking-wider uppercase flex items-center gap-1.5">
                        <span>{t.phone}</span>
                        {t.phone && (
                          <a
                            href={`https://wa.me/91${t.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        )}
                      </div>
                      {t.email ? (
                        <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 truncate mt-0.5">
                          {t.email}
                        </div>
                      ) : (
                        <div className="text-[9px] text-neutral-400 italic">No email</div>
                      )}
                      {t.idNumber && (
                        <div className="text-[8px] font-black text-neutral-400 uppercase tracking-wider mt-0.5">
                          ID: {t.idType || "Doc"} - {t.idNumber}
                        </div>
                      )}
                    </td>

                    {/* PG Stay & Room - No BED BED 1 */}
                    <td className="px-4 py-3 min-w-[190px]">
                      <div className="font-black text-neutral-900 tracking-tight uppercase truncate max-w-[200px]">
                        {t.listing?.title || "N/A"}
                      </div>
                      <div className="text-[9px] font-black text-violet-700 uppercase tracking-wider mt-0.5">
                        {cleanRoomName(t.room?.name)}
                        {t.bed?.name ? ` · ${cleanBedName(t.bed.name)}` : ""}
                      </div>
                      <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                        Rent: ₹{t.monthlyRent?.toLocaleString("en-IN") || 0}/mo
                        {t.securityDeposit ? ` · Dep: ₹${t.securityDeposit.toLocaleString("en-IN")}` : ""}
                      </div>
                    </td>

                    {/* Check-In & Added Dates (Date & Time timestamps - NEVER wraps vertically) */}
                    <td className="px-4 py-3 whitespace-nowrap min-w-[210px]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black shadow-2xs">
                        <Calendar size={11} className="text-emerald-600 shrink-0" />
                        <span>In: {checkIn.date}</span>
                        <span className="text-emerald-700/80 font-semibold text-[9px]">· {checkIn.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400 mt-1 pl-1">
                        <Clock size={10} className="text-neutral-400 shrink-0" />
                        <span>Added: {created.date}</span>
                        <span className="text-neutral-400 font-normal">({created.relative})</span>
                      </div>
                    </td>

                    {/* PG Owner */}
                    <td className="px-4 py-3">
                      <a 
                        href={`/dashboard/admin/users/${t.owner?.id}`} 
                        className="font-black text-neutral-900 hover:text-violet-700 transition-colors tracking-tight uppercase block truncate max-w-[150px]"
                      >
                        {t.owner?.name || "N/A"}
                      </a>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                        {t.owner?.phone}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap min-w-[110px]">
                      <div className="inline-flex flex-col items-center gap-1">
                        {t.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-[9px] font-black bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 shadow-2xs uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        {t.status === "CHECKING_OUT" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-[9px] font-black bg-amber-100/90 text-amber-800 border border-amber-200/80 shadow-2xs uppercase tracking-wider">
                            Checking Out
                          </span>
                        )}
                        {(t.status === "INACTIVE" || t.status === "EVICTED") && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs uppercase tracking-wider">
                            {t.status}
                          </span>
                        )}
                        {t.policeVerificationStatus === "VERIFIED" ? (
                          <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                            <ShieldCheck size={9} /> Police OK
                          </span>
                        ) : t.policeVerificationStatus === "SUBMITTED" ? (
                          <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider">
                            Police Pend
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedTenant(t)}
                          className="cursor-pointer text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all uppercase tracking-wider inline-flex items-center gap-1 active:scale-95"
                          title="View Full Details"
                        >
                          <Eye size={10} /> Details
                        </button>
                        {t.phone && (
                          <a
                            href={`tel:${t.phone}`}
                            className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200/80 flex items-center justify-center transition-colors shadow-2xs"
                            title="Call Tenant"
                          >
                            <Phone size={11} />
                          </a>
                        )}
                        {t.phone && (
                          <a
                            href={`https://wa.me/91${t.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={11} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 text-xs">
                    No tenants found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {data.tenants.map((t: any) => {
            const checkIn = formatDateTime(t.checkInDate);
            const created = formatDateTime(t.createdAt);
            return (
              <div key={`mob-${t.id}`} className="bg-white/80 backdrop-blur-md border border-neutral-200/70 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => setSelectedTenant(t)}
                      className="font-black text-sm uppercase tracking-tight text-neutral-900 hover:text-violet-700 transition-colors truncate block text-left"
                    >
                      {t.name}
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                      {t.phone} {t.email ? `· ${t.email}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {t.status === "ACTIVE" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase shadow-2xs">
                        Active
                      </span>
                    )}
                    {t.status === "CHECKING_OUT" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 border border-amber-200 text-[9px] font-black uppercase shadow-2xs">
                        Checking Out
                      </span>
                    )}
                    {(t.status === "INACTIVE" || t.status === "EVICTED") && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black uppercase shadow-2xs">
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
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Room/Bed</div>
                    <div className="text-xs font-black text-violet-700 truncate">
                      {t.room?.name ? cleanRoomName(t.room.name) : "Room"} {t.bed?.name ? `· ${cleanBedName(t.bed.name)}` : ""}
                    </div>
                  </div>
                  <div className="border-l border-neutral-200/60 truncate px-1">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">PG</div>
                    <div className="text-xs font-black text-neutral-800 truncate">{t.listing?.title || "N/A"}</div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-1 text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Calendar size={10} /> Check-In:
                    </span>
                    <span className="text-neutral-900 font-black">{checkIn.date} · {checkIn.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Clock size={10} /> Added to CRM:
                    </span>
                    <span className="text-neutral-700">{created.date} ({created.relative})</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                  <button
                    onClick={() => setSelectedTenant(t)}
                    className="flex-1 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Eye size={11} /> View Full Profile
                  </button>
                  {t.phone && (
                    <a
                      href={`tel:${t.phone}`}
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition-colors"
                      title="Call Tenant"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  {t.phone && (
                    <a
                      href={`https://wa.me/91${t.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {data.tenants.length === 0 && (
            <div className="text-center p-8 text-neutral-500 text-xs bg-white/40 rounded-2xl border border-neutral-100">
              No tenants found.
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {data.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
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

      {/* FULL TENANT DETAILS MODAL */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {selectedTenant.name?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-neutral-900 tracking-tight uppercase">
                      {selectedTenant.name}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      selectedTenant.status === "ACTIVE" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : selectedTenant.status === "CHECKING_OUT"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {selectedTenant.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                    Tenant ID #{selectedTenant.id} · {selectedTenant.gender || "MALE"} · {selectedTenant.occupation || "Student / Professional"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Contact Action Bar */}
            <div className="flex flex-wrap gap-2">
              {selectedTenant.phone && (
                <a
                  href={`tel:${selectedTenant.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shadow-2xs"
                >
                  <Phone size={12} /> Call: {selectedTenant.phone}
                </a>
              )}
              {selectedTenant.phone && (
                <a
                  href={`https://wa.me/91${selectedTenant.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm"
                >
                  <MessageCircle size={12} /> WhatsApp
                </a>
              )}
              {selectedTenant.email && (
                <a
                  href={`mailto:${selectedTenant.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-black uppercase tracking-wider"
                >
                  <Mail size={12} /> {selectedTenant.email}
                </a>
              )}
            </div>

            {/* Section 1: Stay & Accommodation */}
            <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                <Building2 size={13} /> Stay & Room Allocation
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">PG Name</span>
                  <span className="font-black text-neutral-900">{selectedTenant.listing?.title || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Room Number</span>
                  <span className="font-black text-neutral-900">{cleanRoomName(selectedTenant.room?.name) || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Bed Number</span>
                  <span className="font-black text-neutral-900">{cleanBedName(selectedTenant.bed?.name) || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Monthly Rent</span>
                  <span className="font-black text-emerald-700">₹{selectedTenant.monthlyRent?.toLocaleString("en-IN") || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Security Deposit</span>
                  <span className="font-bold text-neutral-800">₹{selectedTenant.securityDeposit?.toLocaleString("en-IN") || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Rent Due Day</span>
                  <span className="font-bold text-neutral-800">{selectedTenant.rentDueDay ? `${selectedTenant.rentDueDay}th of month` : "5th of month"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">PG Address</span>
                  <span className="font-bold text-neutral-700 truncate block">{selectedTenant.listing?.address || "Address not specified"}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Exact Timestamps (kab aaya) */}
            <div className="bg-violet-50/60 rounded-2xl p-4 border border-violet-100 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-violet-800 flex items-center gap-1.5">
                <Calendar size={13} /> Timestamps & Dates (Kab Aaya)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-3.5 rounded-xl border border-violet-200/50 shadow-2xs">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Check-In Date & Time</span>
                  <div className="font-black text-neutral-900 text-sm mt-1">
                    {formatDateTime(selectedTenant.checkInDate).date} · {formatDateTime(selectedTenant.checkInDate).time}
                  </div>
                  <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                    ({formatDateTime(selectedTenant.checkInDate).relative})
                  </div>
                </div>
                <div className="bg-white/80 p-3.5 rounded-xl border border-violet-200/50 shadow-2xs">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Added to CRM Timestamp</span>
                  <div className="font-black text-neutral-900 text-sm mt-1">
                    {formatDateTime(selectedTenant.createdAt).date} · {formatDateTime(selectedTenant.createdAt).time}
                  </div>
                  <div className="text-[9px] font-bold text-neutral-400 mt-0.5">
                    ({formatDateTime(selectedTenant.createdAt).relative})
                  </div>
                </div>
                {selectedTenant.noticeDate && (
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block">Notice Given Date</span>
                    <div className="font-bold text-neutral-900 mt-0.5">
                      {formatDateTime(selectedTenant.noticeDate).full}
                    </div>
                  </div>
                )}
                {selectedTenant.checkOutDate && (
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-200/50">
                    <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block">Check-Out Date</span>
                    <div className="font-bold text-neutral-900 mt-0.5">
                      {formatDateTime(selectedTenant.checkOutDate).full}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Identity & Verification */}
            <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" /> Identity, Verification & Personal
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">ID Document</span>
                  <span className="font-bold text-neutral-900">{selectedTenant.idType || "N/A"}: {selectedTenant.idNumber || "Not recorded"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Police Verification</span>
                  <span className={`font-black uppercase text-[10px] ${
                    selectedTenant.policeVerificationStatus === "VERIFIED" ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {selectedTenant.policeVerificationStatus || "NOT_SUBMITTED"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Blood Group</span>
                  <span className="font-bold text-neutral-900">{selectedTenant.bloodGroup || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Workplace / College</span>
                  <span className="font-bold text-neutral-900">{selectedTenant.workplace || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Permanent Address</span>
                  <span className="font-medium text-neutral-700">{selectedTenant.permanentAddress || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Guardian & Emergency */}
            {(selectedTenant.guardianName || selectedTenant.guardianPhone) && (
              <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <User size={13} /> Guardian / Emergency Contact
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Guardian Name</span>
                    <span className="font-bold text-neutral-900">{selectedTenant.guardianName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Relation</span>
                    <span className="font-bold text-neutral-900">{selectedTenant.guardianRelation || "Guardian"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Guardian Phone</span>
                    {selectedTenant.guardianPhone ? (
                      <a href={`tel:${selectedTenant.guardianPhone}`} className="font-bold text-violet-700 hover:underline">
                        {selectedTenant.guardianPhone}
                      </a>
                    ) : (
                      <span className="text-neutral-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: PG Owner Details */}
            <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Managed By PG Owner</span>
                <span className="font-black text-neutral-900 text-sm">{selectedTenant.owner?.name || "N/A"}</span>
                <span className="text-neutral-500 text-xs ml-2">({selectedTenant.owner?.phone})</span>
              </div>
              {selectedTenant.owner?.id && (
                <a
                  href={`/dashboard/admin/users/${selectedTenant.owner.id}`}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-sm"
                >
                  View Owner <ArrowRight size={11} />
                </a>
              )}
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTenant(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
