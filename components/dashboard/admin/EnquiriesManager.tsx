"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  User,
  Calendar,
  Globe,
  RefreshCw,
  Send,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";

export interface ContactEnquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  isRead: boolean;
  adminNotes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export function EnquiriesManager({
  initialEnquiries,
  initialCounts,
}: {
  initialEnquiries: ContactEnquiryItem[];
  initialCounts: { total: number; unread: number; pending: number; resolved: number };
}) {
  const [enquiries, setEnquiries] = useState<ContactEnquiryItem[]>(initialEnquiries);
  const [counts, setCounts] = useState(initialCounts);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [unreadFilter, setUnreadFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState("");
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const isFirstRender = useRef(true);

  const getWhatsAppUrl = (phone: string | null | undefined, name: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${normalized}?text=Hi%20${encodeURIComponent(
      name
    )},%20thank%20you%20for%20contacting%20PGSathi.`;
  };

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (unreadFilter) params.set("unread", "true");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setEnquiries(data.enquiries || []);
        if (data.counts) setCounts(data.counts);
      } else {
        toast.error(data.error || "Failed to load enquiries");
      }
    } catch {
      toast.error("Network error fetching enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, unreadFilter, searchQuery]);

  const handleToggleRead = async (enquiry: ContactEnquiryItem) => {
    const nextRead = !enquiry.isRead;
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: nextRead }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === enquiry.id ? { ...item, isRead: nextRead } : item))
        );
        if (selectedEnquiry?.id === enquiry.id) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, isRead: nextRead } : null));
        }
        setCounts((c) => ({
          ...c,
          unread: nextRead ? Math.max(0, c.unread - 1) : c.unread + 1,
        }));
        toast.success(nextRead ? "Marked as read" : "Marked as unread");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleStatusChange = async (enquiryId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === enquiryId ? { ...item, status: newStatus } : item))
        );
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setCounts((c) => {
          const oldItem = enquiries.find((e) => e.id === enquiryId);
          if (!oldItem || oldItem.status === newStatus) return c;
          const next = { ...c };
          if (oldItem.status === "PENDING") next.pending = Math.max(0, next.pending - 1);
          if (oldItem.status === "RESOLVED") next.resolved = Math.max(0, next.resolved - 1);
          if (newStatus === "PENDING") next.pending += 1;
          if (newStatus === "RESOLVED") next.resolved += 1;
          return next;
        });
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (enquiryId: number) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCounts((c) => {
          const item = enquiries.find((e) => e.id === enquiryId);
          if (!item) return c;
          return {
            total: Math.max(0, c.total - 1),
            unread: item.isRead ? c.unread : Math.max(0, c.unread - 1),
            pending: item.status === "PENDING" ? Math.max(0, c.pending - 1) : c.pending,
            resolved: item.status === "RESOLVED" ? Math.max(0, c.resolved - 1) : c.resolved,
          };
        });
        setEnquiries((prev) => prev.filter((item) => item.id !== enquiryId));
        if (selectedEnquiry?.id === enquiryId) setSelectedEnquiry(null);
        toast.success("Enquiry deleted");
      }
    } catch {
      toast.error("Failed to delete enquiry");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedEnquiry) return;
    setIsUpdatingNote(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: adminNoteText }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === selectedEnquiry.id ? { ...item, adminNotes: adminNoteText } : item
          )
        );
        setSelectedEnquiry((prev) => (prev ? { ...prev, adminNotes: adminNoteText } : null));
        toast.success("Admin note saved");
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const openEnquiryModal = (enquiry: ContactEnquiryItem) => {
    setSelectedEnquiry(enquiry);
    setAdminNoteText(enquiry.adminNotes || "");
    if (!enquiry.isRead) {
      handleToggleRead(enquiry);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Metric Badges Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => {
            setStatusFilter("ALL");
            setUnreadFilter(false);
          }}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === "ALL" && !unreadFilter
              ? "border-violet-500 shadow-md ring-2 ring-violet-500/10"
              : "border-neutral-200/80 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <MessageSquare size={16} className="text-violet-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{counts.total}</p>
        </div>

        <div
          onClick={() => {
            setUnreadFilter(true);
            setStatusFilter("ALL");
          }}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            unreadFilter
              ? "border-amber-500 shadow-md ring-2 ring-amber-500/10"
              : "border-neutral-200/80 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Unread</span>
            {counts.unread > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-amber-600">{counts.unread}</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter("PENDING");
            setUnreadFilter(false);
          }}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === "PENDING" && !unreadFilter
              ? "border-blue-500 shadow-md ring-2 ring-blue-500/10"
              : "border-neutral-200/80 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600">{counts.pending}</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter("RESOLVED");
            setUnreadFilter(false);
          }}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === "RESOLVED" && !unreadFilter
              ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
              : "border-neutral-200/80 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{counts.resolved}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or message..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PENDING", "CONTACTED", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setUnreadFilter(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status && !unreadFilter
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {status}
            </button>
          ))}

          <button
            onClick={() => fetchEnquiries()}
            title="Refresh"
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Enquiries Table / Card List ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-base font-bold text-neutral-800 mb-1">No enquiries found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL" || unreadFilter
                ? "Try clearing filters to see all received customer messages."
                : "No customer enquiries have been submitted through the contact page yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {enquiries.map((item) => {
              const waUrl = getWhatsAppUrl(item.phone, item.name);

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition-colors hover:bg-neutral-50/80 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    !item.isRead ? "bg-violet-50/30" : ""
                  }`}
                >
                  {/* Left Info */}
                  <div
                    onClick={() => openEnquiryModal(item)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                      )}
                      <h4 className="font-extrabold text-neutral-900 text-sm sm:text-base truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                        {item.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "CONTACTED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 mb-2 font-normal leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-1 text-neutral-600">
                        <Mail size={12} /> {item.email}
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1 text-neutral-600">
                          <Phone size={12} /> {item.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 pt-2.5 md:pt-0 border-t border-neutral-100 md:border-0 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp */}
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Chat on WhatsApp"
                          className="h-8.5 px-2.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors inline-flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                        >
                          <Send size={13} />
                          <span className="md:hidden">WhatsApp</span>
                        </a>
                      )}

                      {/* Call */}
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          title="Call"
                          className="w-8.5 h-8.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center justify-center shadow-2xs"
                        >
                          <Phone size={14} />
                        </a>
                      )}

                      {/* Email */}
                      <a
                        href={`mailto:${item.email}?subject=Re:%20${encodeURIComponent(
                          item.subject
                        )}%20-%20PGSathi%20Support`}
                        title="Reply via Email"
                        className="w-8.5 h-8.5 rounded-xl text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200/60 transition-colors flex items-center justify-center shadow-2xs"
                      >
                        <Mail size={14} />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Mark Read/Unread */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(item)}
                        title={item.isRead ? "Mark Unread" : "Mark Read"}
                        className="w-8.5 h-8.5 rounded-xl text-neutral-500 hover:bg-neutral-100 border border-neutral-200/60 transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                      >
                        {item.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => openEnquiryModal(item)}
                        className="h-8.5 px-3 rounded-xl bg-neutral-900 text-white font-black text-xs hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        View
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Delete enquiry"
                        className="w-8.5 h-8.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Enquiry Details Modal ── */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
              <div>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                  Enquiry #{selectedEnquiry.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
                  {selectedEnquiry.subject}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Received on {format(new Date(selectedEnquiry.createdAt), "dd MMMM yyyy, hh:mm a")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sender Profile Box */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-400 font-bold block mb-0.5 uppercase tracking-wider">
                  Full Name
                </span>
                <span className="font-extrabold text-neutral-900 text-sm">
                  {selectedEnquiry.name}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 font-bold block mb-0.5 uppercase tracking-wider">
                  Email Address
                </span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="font-bold text-violet-600 hover:underline"
                >
                  {selectedEnquiry.email}
                </a>
              </div>
              {selectedEnquiry.phone && (
                <div>
                  <span className="text-neutral-400 font-bold block mb-0.5 uppercase tracking-wider">
                    Phone / WhatsApp
                  </span>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    {selectedEnquiry.phone}
                  </a>
                </div>
              )}
              {selectedEnquiry.ipAddress && (
                <div>
                  <span className="text-neutral-400 font-bold block mb-0.5 uppercase tracking-wider">
                    IP Address
                  </span>
                  <span className="font-mono text-neutral-600">{selectedEnquiry.ipAddress}</span>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                User Message
              </h4>
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status & Quick Action Row */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Update Status
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {["PENDING", "CONTACTED", "RESOLVED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(selectedEnquiry.id, status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      selectedEnquiry.status === status
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Internal Admin Notes
              </h4>
              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder="Add confidential notes about resolution, caller details, etc..."
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none"
              ></textarea>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isUpdatingNote}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isUpdatingNote ? "Saving..." : "Save Admin Note"}
              </button>
            </div>

            {/* Modal Bottom Communication CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re:%20${encodeURIComponent(
                    selectedEnquiry.subject
                  )}%20-%20PGSathi%20Support`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors shadow-sm"
                >
                  <Mail size={13} /> Reply by Email
                </a>
                {selectedEnquiry.phone && getWhatsAppUrl(selectedEnquiry.phone, selectedEnquiry.name) && (
                  <a
                    href={getWhatsAppUrl(selectedEnquiry.phone, selectedEnquiry.name)!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Send size={13} /> Chat WhatsApp
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
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
