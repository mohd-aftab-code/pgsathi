"use client";
import { useState, useEffect } from "react";
import { Globe, MapPin, Edit, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCitiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ metaTitle: "", metaDesc: "" });

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cities");
      const d = await res.json();
      if (d.success) setData(d.data);
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSave(cityId: number) {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId, metaTitle: formData.metaTitle, metaDesc: formData.metaDesc })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        setEditingId(null);
        fetchData();
      } else {
        toast.error(d.message);
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
          <Globe className="text-emerald-500" size={28} /> Dynamic City CMS
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Manage SEO Meta Titles and Descriptions for city landing pages.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading cities...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.map((city: any) => (
            <div key={city.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2 font-bold text-lg text-neutral-900 capitalize">
                  <MapPin className="text-emerald-500" size={20} /> {city.name}
                </div>
                {editingId !== city.id && (
                  <button 
                    onClick={() => {
                      setEditingId(city.id);
                      setFormData({ metaTitle: city.metaTitle || "", metaDesc: city.metaDesc || "" });
                    }}
                    className="cursor-pointer text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit SEO
                  </button>
                )}
              </div>

              {editingId === city.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Meta Title</label>
                    <input 
                      type="text" 
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full text-sm border-neutral-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g. Best PGs in Noida | Top Hostels"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Meta Description</label>
                    <textarea 
                      value={formData.metaDesc}
                      onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                      className="w-full text-sm border-neutral-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 h-20"
                      placeholder="e.g. Find the most affordable and premium PGs in Noida with zero brokerage..."
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="cursor-pointer px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={processing}
                      onClick={() => handleSave(city.id)}
                      className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Meta Title</div>
                    <div className="text-sm font-semibold text-neutral-800 truncate">
                      {city.metaTitle || <span className="text-neutral-400 italic">Default fallback will be used</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Meta Description</div>
                    <div className="text-sm text-neutral-600 line-clamp-2">
                      {city.metaDesc || <span className="text-neutral-400 italic">Default fallback will be used</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
