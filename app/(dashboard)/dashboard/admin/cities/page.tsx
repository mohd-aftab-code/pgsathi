"use client";

import { useState, useEffect } from "react";
import {
  MapPin, Plus, Power, PowerOff, Edit2, Check, X,
  Loader2, Building2, Search,
} from "lucide-react";
import toast from "react-hot-toast";

type City = {
  id: number;
  name: string;
  state: string;
  slug: string;
  isActive: boolean;
  priority: number;
  _count: { listings: number; localities: number };
};

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editState, setEditState] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newState, setNewState] = useState("");
  const [newPriority, setNewPriority] = useState("0");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cities");
      const d = await res.json();
      if (d.success) setCities(d.data);
    } catch {
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: number) {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); load(); }
      else toast.error(d.message);
    } finally {
      setProcessing(null);
    }
  }

  async function saveEdit(id: number) {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "update", name: editName, state: editState, priority: editPriority }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); setEditingId(null); load(); }
      else toast.error(d.message);
    } finally {
      setProcessing(null);
    }
  }

  async function addCity() {
    if (!newName.trim() || !newState.trim()) { toast.error("Name and state required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, state: newState, priority: newPriority }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        setNewName(""); setNewState(""); setNewPriority("0"); setShowAdd(false);
        load();
      } else toast.error(d.message);
    } finally {
      setAdding(false);
    }
  }

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const active = cities.filter((c) => c.isActive).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
            <MapPin size={20} className="text-violet-600" /> City Management
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {active} active · {cities.length} total cities on the platform
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} /> Add City
        </button>
      </div>

      {/* Add City Form */}
      {showAdd && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-violet-900 mb-4">New City</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">City Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">State *</label>
              <input
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">Priority (higher = first)</label>
              <input
                type="number"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addCity}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {adding ? "Adding..." : "Add City"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cities or states..."
          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-neutral-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading cities...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                  <th className="px-5 py-3 font-bold">City</th>
                  <th className="px-3 py-3 font-bold">State</th>
                  <th className="px-3 py-3 font-bold">Slug</th>
                  <th className="px-3 py-3 font-bold text-center">PGs</th>
                  <th className="px-3 py-3 font-bold text-center">Localities</th>
                  <th className="px-3 py-3 font-bold text-center">Priority</th>
                  <th className="px-3 py-3 font-bold text-center">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((city) => (
                  <tr key={city.id} className={`hover:bg-neutral-50/70 transition-colors ${!city.isActive ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3">
                      {editingId === city.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-violet-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <span className="font-semibold text-neutral-800">{city.name}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingId === city.id ? (
                        <input
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full px-2 py-1 border border-violet-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <span className="text-neutral-500 text-xs">{city.state}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-neutral-400 text-xs font-mono">{city.slug}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full text-xs">
                        {city._count.listings}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-neutral-500 text-xs">{city._count.localities}</td>
                    <td className="px-3 py-3 text-center">
                      {editingId === city.id ? (
                        <input
                          type="number"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="w-16 px-2 py-1 border border-violet-300 rounded-lg text-sm text-center focus:outline-none"
                        />
                      ) : (
                        <span className="text-neutral-500 text-xs">{city.priority}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        city.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {city.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {editingId === city.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(city.id)}
                              disabled={processing === city.id}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors"
                            >
                              {processing === city.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(city.id);
                                setEditName(city.name);
                                setEditState(city.state);
                                setEditPriority(String(city.priority));
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => toggle(city.id)}
                              disabled={processing === city.id}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                city.isActive
                                  ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                              }`}
                              title={city.isActive ? "Deactivate" : "Activate"}
                            >
                              {processing === city.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : city.isActive ? <PowerOff size={13} /> : <Power size={13} />
                              }
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-neutral-400 text-sm">
                      {search ? `No cities matching "${search}"` : "No cities yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
