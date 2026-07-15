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
    maxTenants: "",
    features: [] as { name: string; included: boolean }[],
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
        maxTenants: plan.maxTenants ? plan.maxTenants.toString() : "",
        features: Array.isArray(plan.features) ? plan.features : [],
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
        maxTenants: "",
        features: [],
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

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { name: "", included: true }]
    });
  };

  const updateFeature = (index: number, key: string, value: any) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [key]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
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
        <h1 className="text-3xl font-extrabold mb-2 relative z-10 text-white">Subscription Plans</h1>
        <p className="text-neutral-300 relative z-10">Manage pricing tiers for PG Owners.</p>
        <button 
          onClick={() => handleOpenForm()}
          className="cursor-pointer mt-6 bg-white text-neutral-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-100 transition-colors"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max PGs (Listings) [-1 for Unlimited]</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.maxListings} onChange={e => setFormData({...formData, maxListings: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max Tenants [-1 for Unlimited]</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.maxTenants} onChange={e => setFormData({...formData, maxTenants: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Max Photos</label>
              <input required type="number" className="w-full border rounded-xl p-2.5" value={formData.maxPhotos} onChange={e => setFormData({...formData, maxPhotos: e.target.value})} />
            </div>
            
            <div className="md:col-span-2 bg-neutral-50 p-4 sm:p-6 rounded-2xl border border-neutral-200 mt-2">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Features Checklist</h3>
                  <p className="text-sm text-neutral-500">Add features and toggle if they are included in this plan.</p>
                </div>
                <button type="button" onClick={addFeature} className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                  <Plus size={16} /> Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm transition-all focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                    <input 
                      type="text" 
                      placeholder="e.g. Audit log, Meter billing..." 
                      className="flex-1 border-none focus:ring-0 text-sm font-medium outline-none px-2" 
                      value={feat.name} 
                      onChange={e => updateFeature(idx, "name", e.target.value)} 
                    />
                    <div className="w-px h-6 bg-neutral-200"></div>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer shrink-0 min-w-24 px-2 select-none">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary-600 rounded cursor-pointer"
                        checked={feat.included} 
                        onChange={e => updateFeature(idx, "included", e.target.checked)} 
                      />
                      <span className={feat.included ? 'text-green-600' : 'text-neutral-400'}>
                        {feat.included ? 'Included' : 'Excluded'}
                      </span>
                    </label>
                    <button type="button" onClick={() => removeFeature(idx)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
                {formData.features.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                    <p className="text-sm font-medium">No features added yet.</p>
                    <p className="text-xs mt-1">Click "Add Feature" to start building the checklist.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-4 mt-4">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer">Save Plan</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="cursor-pointer px-6 py-2.5 rounded-xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200">Cancel</button>
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
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> {plan.maxListings === -1 ? 'Unlimited' : `Up to ${plan.maxListings}`} PGs</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> {plan.maxTenants === -1 ? 'Unlimited' : `Up to ${plan.maxTenants}`} Tenants</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> {plan.maxPhotos} Photos</div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                <button onClick={() => handleOpenForm(plan)} className="cursor-pointer flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 flex justify-center"><Edit size={18} /></button>
                <button onClick={() => toggleStatus(plan)} className={`cursor-pointer flex-1 p-2 rounded-lg font-semibold flex justify-center ${plan.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {plan.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <button onClick={() => handleDelete(plan.id)} className="cursor-pointer flex-1 p-2 bg-primary-50 text-primary-600 rounded-lg font-semibold hover:bg-primary-100 flex justify-center"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
