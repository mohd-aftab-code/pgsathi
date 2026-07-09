/**
 * app/(main)/dashboard/manager/mess/page.tsx
 * Weekly mess menu manager.
 */
"use client";
import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import toast from "react-hot-toast";

const DAYS = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

export default function MessMenuPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [listingId, setListingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for the 7 days menu
  const [menu, setMenu] = useState<any[]>(
    DAYS.map(d => ({ dayOfWeek: d.id, breakfast: "", lunch: "", snacks: "", dinner: "" }))
  );

  useEffect(() => {
    // We can re-use the tenants API listing fetch logic, or just a generic listing API.
    // For now we'll fetch from an existing API or just assume the owner has listings.
    fetch("/api/listings")
      .then(r => r.json())
      .then(d => {
        const data = d.data || d.listings || [];
        setListings(data);
        if (data.length > 0) setListingId(String(data[0].id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    fetch(`/api/manage/mess?listingId=${listingId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          // Merge fetched data with default structure
          const newMenu = DAYS.map(day => {
            const existing = d.data.find((m: any) => m.dayOfWeek === day.id);
            return existing || { dayOfWeek: day.id, breakfast: "", lunch: "", snacks: "", dinner: "" };
          });
          setMenu(newMenu);
        } else {
          // Reset
          setMenu(DAYS.map(d => ({ dayOfWeek: d.id, breakfast: "", lunch: "", snacks: "", dinner: "" })));
        }
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  function handleChange(dayId: number, field: string, val: string) {
    setMenu(menu.map(m => m.dayOfWeek === dayId ? { ...m, [field]: val } : m));
  }

  async function saveMenu() {
    if (!listingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/manage/mess", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, days: menu }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success("Mess menu updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Mess Menu</h1>
          <p className="text-sm text-neutral-500 mt-1">Hafte bhar ka khana plan karein</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={listingId} onChange={e => setListingId(e.target.value)} className="input-base w-48 bg-white">
            {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <button onClick={saveMenu} disabled={saving || !listingId} className="btn-primary text-sm px-6">
            {saving ? "Saving…" : "Save Menu"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-neutral-400">Loading menu…</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600 w-32">Day</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Breakfast</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Lunch</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Snacks</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Dinner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {DAYS.map(day => {
                  const m = menu.find(x => x.dayOfWeek === day.id)!;
                  return (
                    <tr key={day.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-semibold text-neutral-900">{day.label}</td>
                      <td className="px-2 py-2">
                        <textarea value={m.breakfast || ""} onChange={e => handleChange(day.id, "breakfast", e.target.value)} rows={2} className="w-full text-xs p-2 border border-neutral-200 rounded resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Aloo paratha..." />
                      </td>
                      <td className="px-2 py-2">
                        <textarea value={m.lunch || ""} onChange={e => handleChange(day.id, "lunch", e.target.value)} rows={2} className="w-full text-xs p-2 border border-neutral-200 rounded resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Rajma chawal..." />
                      </td>
                      <td className="px-2 py-2">
                        <textarea value={m.snacks || ""} onChange={e => handleChange(day.id, "snacks", e.target.value)} rows={2} className="w-full text-xs p-2 border border-neutral-200 rounded resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Chai & biscuit..." />
                      </td>
                      <td className="px-2 py-2">
                        <textarea value={m.dinner || ""} onChange={e => handleChange(day.id, "dinner", e.target.value)} rows={2} className="w-full text-xs p-2 border border-neutral-200 rounded resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Roti sabzi..." />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
