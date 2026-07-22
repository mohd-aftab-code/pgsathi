"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileUp, X, Loader2, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import toast from "react-hot-toast";

/** Splits one CSV line, honouring quoted fields and escaped ("") quotes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// Accept a few common header spellings for each field
const HEADER_MAP: Record<string, string> = {
  name: "name", "tenant": "name", "tenant name": "name", "full name": "name",
  phone: "phone", mobile: "phone", contact: "phone", "phone number": "phone", "mobile number": "phone",
  email: "email", "email address": "email",
  rent: "monthlyRent", "monthly rent": "monthlyRent", monthlyrent: "monthlyRent",
  "check-in date": "checkInDate", "check in date": "checkInDate", checkin: "checkInDate",
  "checkin date": "checkInDate", "joining date": "checkInDate",
};

const SAMPLE = `Name,Phone,Email,Monthly Rent,Check-in Date
Rohit Sharma,9876543210,rohit@example.com,7500,2026-07-01
Anjali Verma,9812345678,,8200,2026-07-05`;

export function ImportCsvButton({
  listings,
  canImport,
}: {
  listings: { id: number; title: string }[];
  canImport: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [listingId, setListingId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setListingId(""); setFileName(""); setRows([]); setResult(null); setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setResult(null);
    try {
      const text = await f.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
      if (lines.length < 2) { toast.error("File is empty or has only a header row"); setRows([]); return; }
      const headers = splitCsvLine(lines[0]).map((h) => HEADER_MAP[h.trim().toLowerCase()] ?? "");
      if (!headers.includes("name") || !headers.includes("phone")) {
        toast.error("CSV must have at least Name and Phone columns");
        setRows([]);
        return;
      }
      const parsed = lines.slice(1).map((l) => {
        const cells = splitCsvLine(l);
        const row: Record<string, string> = {};
        headers.forEach((key, i) => { if (key) row[key] = (cells[i] ?? "").trim(); });
        return row;
      });
      setRows(parsed);
    } catch {
      toast.error("Could not read that file");
      setRows([]);
    }
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "PGSathi_Tenants_Sample.csv";
    a.click();
  }

  async function submit() {
    if (!listingId) { toast.error("Choose which PG to import into"); return; }
    if (!rows.length) { toast.error("Upload a CSV file first"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/manage/tenants/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, rows }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || "Import failed");
      setResult(d);
      toast.success(`${d.created} tenants imported`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          if (!canImport) {
            // Locked → take them straight to the plans page instead of a dead-end toast
            toast("Bulk Import is a Pro plan feature", { icon: "🔒" });
            router.push("/dashboard/owner/subscription/upgrade");
            return;
          }
          reset();
          setOpen(true);
        }}
        title={canImport ? "Import tenants from CSV" : "Pro plan feature — see plans"}
        className={`btn-outline py-1.5 px-3 text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-1.5 ${canImport ? "" : "opacity-75"}`}
      >
        <FileUp className="h-4 w-4" /> Import CSV
        {!canImport && <span className="ml-1 text-[10px] bg-violet-100 text-violet-700 px-1 rounded">PRO</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <FileUp size={18} className="text-violet-600" /> Import Tenants
              </h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                <X size={16} />
              </button>
            </div>

            {result ? (
              <div className="p-5">
                <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                  <CheckCircle2 size={20} /> Import complete
                </div>
                <ul className="text-sm text-neutral-700 space-y-1.5 mb-4">
                  <li>✅ <strong>{result.created}</strong> tenants added to {result.property}</li>
                  {result.skipped > 0 && <li>↩️ <strong>{result.skipped}</strong> skipped (phone already exists)</li>}
                  {result.problemCount > 0 && (
                    <li className="text-amber-700">
                      ⚠️ <strong>{result.problemCount}</strong> rows had problems:
                      <ul className="mt-1 ml-4 text-xs list-disc text-amber-700/90">
                        {result.problems.map((p: string, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </li>
                  )}
                </ul>
                <button onClick={() => setOpen(false)} className="btn-primary w-full py-2 text-sm rounded-lg">Done</button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Import into which PG?</label>
                  <select value={listingId} onChange={(e) => setListingId(e.target.value)} className="input-base w-full text-sm">
                    <option value="">Choose a property…</option>
                    {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">CSV file</label>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile}
                    className="block w-full text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 file:font-semibold file:text-sm hover:file:bg-violet-100 cursor-pointer" />
                  {fileName && rows.length > 0 && (
                    <p className="text-xs text-green-700 mt-1.5 font-medium">✓ {fileName} — {rows.length} rows ready</p>
                  )}
                </div>

                <div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Columns: <strong>Name, Phone</strong> (required), Email, Monthly Rent, Check-in Date.
                    Duplicate phone numbers are skipped automatically.
                    <button onClick={downloadSample} className="ml-1 text-violet-600 font-semibold hover:underline inline-flex items-center gap-0.5">
                      <Download size={11} /> sample CSV
                    </button>
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setOpen(false)} className="btn-outline flex-1 py-2 text-sm rounded-lg">Cancel</button>
                  <button onClick={submit} disabled={busy || !rows.length || !listingId}
                    className="btn-primary flex-1 py-2 text-sm rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {busy ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : `Import ${rows.length || ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
