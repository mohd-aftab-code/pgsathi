"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, ShieldCheck, PowerOff, Power } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    yearlyPrice: "",
    maxListings: "",
    maxPhotos: "",
    isActive: true,
  });

  const fetchPlans = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    if (data.success) {
      setPlans(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenForm = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        price: plan.price.toString(),
        yearlyPrice: plan.yearlyPrice ? plan.yearlyPrice.toString() : "",
        maxListings: plan.maxListings.toString(),
        maxPhotos: plan.maxPhotos.toString(),
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        slug: "",
        price: "",
        yearlyPrice: "",
        maxListings: "",
        maxPhotos: "",
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans";
    const method = editingPlan ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsFormOpen(false);
      fetchPlans();
    } else {
      alert("Failed to save plan.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan? This could break active subscriptions.")) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    if (res.ok) fetchPlans();
    else alert("Failed to delete.");
  };

  const toggleStatus = async (plan: any) => {
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    if (res.ok) fetchPlans();
  };

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Subscription Plans</h1>
        <p className="text-neutral-300 relative z-10">Manage pricing tiers for PG Owners.</p>
        <button 
          onClick={() => handleOpenForm()}
          className="mt-6 bg-white text-neutral-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-100 transition-colors"
        >
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 mb-8">
          <h2 className="text-xl font-bold mb-6">{editingPlan ? "Edit Plan" : "Create Plan"}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Plan Name</label>
              <input required type="text" className="w-full border rounded-xl p-2.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (e.g. basic, pro)</label>
              <input required type="text" className="w-full border rounded-xl p-2.5" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Price (₹)</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Yearly Price (₹)</label>
              <input type="number" className="w-full border rounded-xl p-2.5" value={formData.yearlyPrice} onChange={e => setFormData({...formData, yearlyPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max Listings</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.maxListings} onChange={e => setFormData({...formData, maxListings: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max Photos</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.maxPhotos} onChange={e => setFormData({...formData, maxPhotos: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex items-center gap-4 mt-4">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold">Save Plan</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex justify-center"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-3xl p-6 border shadow-sm ${!plan.isActive ? 'opacity-60 grayscale' : 'border-neutral-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-neutral-900">{plan.name}</h3>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider">{plan.slug}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary-600">₹{plan.price}</div>
                  <div className="text-xs text-neutral-500">/ month</div>
                </div>
              </div>
              <div className="space-y-2 mb-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Up to {plan.maxListings} PGs</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> {plan.maxPhotos} Photos</div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                <button onClick={() => handleOpenForm(plan)} className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 flex justify-center"><Edit size={18} /></button>
                <button onClick={() => toggleStatus(plan)} className={`flex-1 p-2 rounded-lg font-semibold flex justify-center ${plan.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {plan.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <button onClick={() => handleDelete(plan.id)} className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 flex justify-center"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
