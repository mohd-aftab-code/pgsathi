"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, Phone, MessageCircle, Loader2, Search, Trash2, CalendarClock,
  AlertTriangle, X, ChevronRight,
} from "lucide-react";

type Lead = {
  id: number;
  name: string;
  phone: string;
  city: string | null;
  pgName: string | null;
  stage: string;
  notes: string | null;
  nextFollowUpAt: string | null;
  lostReason: string | null;
  overdue: boolean;
  updatedAt: string;
};

const STAGES = [
  { id: "NEW", label: "Naya", tone: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
  { id: "CONTACTED", label: "Baat hui", tone: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  { id: "DEMO", label: "Demo diya", tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400" },
  { id: "NEGOTIATION", label: "Baat chal rahi", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  { id: "WON", label: "Ho gaya", tone: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400" },
  { id: "LOST", label: "Nahi hua", tone: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
] as const;

const stageOf = (id: string) => STAGES.find((s) => s.id === id) ?? STAGES[0];

export function LeadsBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("stage", filter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/partner/leads?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setCounts(data.counts ?? {});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q]);

  const patch = async (id: number, body: Record<string, unknown>) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/partner/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Update nahi hua"); return; }
      await load();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`${name} ko leads se hata dein?`)) return;
    setBusy(id);
    try {
      await fetch(`/api/partner/leads/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const overdueCount = useMemo(() => leads.filter((l) => l.overdue).length, [leads]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute inset-y-0 left-3 my-auto h-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Naam, number ya PG search karein"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm inline-flex items-center gap-1.5"
        >
          <Plus size={16} /> Lead add karein
        </button>
      </div>

      {/* Stage filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === ""} onClick={() => setFilter("")} label="Sab" count={Object.values(counts).reduce((a, b) => a + b, 0)} />
        {STAGES.map((s) => (
          <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} label={s.label} count={counts[s.id] ?? 0} />
        ))}
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-400">
          <AlertTriangle size={16} />
          {overdueCount} lead ka follow-up due nikal chuka hai — aaj call kar lijiye.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 py-16 text-center">
          <p className="font-bold text-neutral-700 dark:text-neutral-300">Abhi koi lead nahi hai</p>
          <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
            Jis bhi PG owner se baat karein, unhe yahan add kar lijiye — follow-up yaad rahega aur kuch chhutega nahi.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              busy={busy === lead.id}
              onStage={(stage) => patch(lead.id, { stage })}
              onFollowUp={(date) => patch(lead.id, { nextFollowUpAt: date })}
              onDelete={() => remove(lead.id, lead.name)}
            />
          ))}
        </div>
      )}

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
        active
          ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900"
          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      }`}
    >
      {label} {count > 0 && <span className="opacity-60">· {count}</span>}
    </button>
  );
}

function LeadRow({
  lead, busy, onStage, onFollowUp, onDelete,
}: {
  lead: Lead;
  busy: boolean;
  onStage: (stage: string) => void;
  onFollowUp: (date: string) => void;
  onDelete: () => void;
}) {
  const stage = stageOf(lead.stage);
  const closed = lead.stage === "WON" || lead.stage === "LOST";
  const waText = encodeURIComponent(
    `Namaste ${lead.name} 🙏\n\nPGSathi ke baare me baat karni thi — aapka PG online list karne ke liye. 2 minute mil jayenge?`,
  );

  return (
    <div className={`rounded-2xl border bg-white dark:bg-neutral-900 p-4 shadow-sm ${
      lead.overdue ? "border-amber-300 dark:border-amber-800" : "border-neutral-200 dark:border-neutral-800"
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-neutral-900 dark:text-white">{lead.name}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${stage.tone}`}>
              {stage.label}
            </span>
            {lead.overdue && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                follow-up due
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>{lead.phone}</span>
            {lead.pgName && <span>{lead.pgName}</span>}
            {lead.city && <span>{lead.city}</span>}
            {lead.nextFollowUpAt && (
              <span className="inline-flex items-center gap-1">
                <CalendarClock size={11} />
                {new Date(lead.nextFollowUpAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          {lead.notes && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">{lead.notes}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${lead.phone}`}
            className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            aria-label="Call"
          >
            <Phone size={15} />
          </a>
          <a
            href={`https://wa.me/91${lead.phone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <MessageCircle size={15} />
          </a>
          <button
            onClick={onDelete}
            disabled={busy}
            className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-red-600 hover:border-red-200"
            aria-label="Delete"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      {!closed && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1">Move to</span>
          {STAGES.filter((s) => s.id !== lead.stage).map((s) => (
            <button
              key={s.id}
              onClick={() => onStage(s.id)}
              disabled={busy}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
          <label className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
            <CalendarClock size={12} />
            <input
              type="date"
              value={lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : ""}
              onChange={(e) => onFollowUp(e.target.value)}
              disabled={busy}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-[11px] outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function AddLeadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", pgName: "", notes: "", nextFollowUpAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/partner/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Add nahi hua"); return; }
      onDone();
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 text-sm outline-none focus:border-primary-400"
        {...props}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Nayi lead</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {field("name", "Owner ka naam", { required: true, placeholder: "Rahul Sharma" })}
          {field("phone", "Phone", { required: true, inputMode: "numeric", maxLength: 10, placeholder: "9876543210" })}
          <div className="grid grid-cols-2 gap-3">
            {field("pgName", "PG ka naam", { placeholder: "Sunrise PG" })}
            {field("city", "City", { placeholder: "Lucknow" })}
          </div>
          {field("nextFollowUpAt", "Agla follow-up", { type: "date" })}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-neutral-500">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Kya baat hui, kya objection tha…"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-3 text-sm outline-none focus:border-primary-400"
            />
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {saving ? "Add kar rahe hain…" : "Lead add karein"}
          </button>
        </form>
      </div>
    </div>
  );
}
