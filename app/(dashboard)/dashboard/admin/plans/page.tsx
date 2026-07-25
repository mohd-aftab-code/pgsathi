"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, ShieldCheck, PowerOff, Power, Star, Clock } from "lucide-react";
import { CAPABILITY_META, NO_CAPABILITIES, readCapabilities, type PlanCapabilities } from "@/lib/plan-capabilities";

type Feature = { name: string; included: boolean; comingSoon?: boolean };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State — everything a plan shows or unlocks is editable here.
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    badge: "",
    recommended: false,
    sortOrder: "0",
    price: "",
    yearlyPrice: "",
    maxListings: "",
    maxPhotos: "",
    maxTenants: "",
    features: [] as Feature[],
    capabilities: { ...NO_CAPABILITIES } as PlanCapabilities,
    partnerCommissionType: "NONE",
    partnerCommissionValue: "0",
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
        tagline: plan.tagline ?? "",
        badge: plan.badge ?? "",
        recommended: !!plan.recommended,
        sortOrder: (plan.sortOrder ?? 0).toString(),
        price: plan.price.toString(),
        yearlyPrice: plan.yearlyPrice ? plan.yearlyPrice.toString() : "",
        maxListings: plan.maxListings.toString(),
        maxPhotos: plan.maxPhotos.toString(),
        maxTenants: plan.maxTenants ? plan.maxTenants.toString() : "",
        features: Array.isArray(plan.features) ? plan.features : [],
        capabilities: readCapabilities(plan.capabilities),
        partnerCommissionType: plan.partnerCommissionType ?? "NONE",
        partnerCommissionValue: (plan.partnerCommissionValue ?? 0).toString(),
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        slug: "",
        tagline: "",
        badge: "",
        recommended: false,
        sortOrder: (plans.length + 1).toString(),
        price: "",
        yearlyPrice: "",
        maxListings: "",
        maxPhotos: "",
        maxTenants: "",
        features: [],
        capabilities: { ...NO_CAPABILITIES },
        partnerCommissionType: "NONE",
        partnerCommissionValue: "0",
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
      features: [...formData.features, { name: "", included: true, comingSoon: false }]
    });
  };

  const toggleCapability = (key: keyof PlanCapabilities) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: { ...prev.capabilities, [key]: !prev.capabilities[key] },
    }));
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tagline <span className="text-neutral-400 font-normal">(short line under the plan name)</span></label>
              <input type="text" className="w-full border rounded-xl p-2.5" placeholder="e.g. Complete CRM — staff, team logins, audit trail." value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Corner Badge <span className="text-neutral-400 font-normal">(optional, e.g. Unlimited)</span></label>
              <input type="text" maxLength={30} className="w-full border rounded-xl p-2.5" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order <span className="text-neutral-400 font-normal">(lower = shown first)</span></label>
              <input type="number" className="w-full border rounded-xl p-2.5" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${formData.recommended ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded cursor-pointer" checked={formData.recommended} onChange={e => setFormData({...formData, recommended: e.target.checked})} />
                <Star size={16} className={formData.recommended ? 'text-primary-600' : 'text-neutral-400'} />
                <span className="text-sm font-semibold text-neutral-800">Mark as “Recommended” <span className="font-normal text-neutral-500">— highlights this plan on the pricing &amp; upgrade pages</span></span>
              </label>
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
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm transition-all focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                    <input
                      type="text"
                      placeholder="e.g. Audit log, Meter billing..."
                      className="flex-1 min-w-[140px] border-none focus:ring-0 text-sm font-medium outline-none px-2"
                      value={feat.name}
                      onChange={e => updateFeature(idx, "name", e.target.value)}
                    />
                    <div className="hidden sm:block w-px h-6 bg-neutral-200"></div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer shrink-0 px-2 select-none">
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
                    <div className="hidden sm:block w-px h-6 bg-neutral-200"></div>
                    {/* Coming-soon marks a feature as promised-but-not-live (amber clock on the cards). */}
                    <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer shrink-0 px-2 select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                        checked={!!feat.comingSoon}
                        onChange={e => updateFeature(idx, "comingSoon", e.target.checked)}
                      />
                      <span className={feat.comingSoon ? 'text-amber-600 flex items-center gap-1' : 'text-neutral-400 flex items-center gap-1'}>
                        <Clock size={13} /> Soon
                      </span>
                    </label>
                    <button type="button" onClick={() => removeFeature(idx)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"><Trash2 size={18}/></button>
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

            {/* Capabilities — the actual feature switches this plan unlocks. These
                drive the real gates in the app (CSV, ads, staff, leads, CRM). */}
            <div className="md:col-span-2 bg-neutral-50 p-4 sm:p-6 rounded-2xl border border-neutral-200 mt-2">
              <div className="mb-4 pb-4 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Feature Access</h3>
                <p className="text-sm text-neutral-500">Turn on what this plan unlocks. Ye seedhe app ke gates control karte hain.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAPABILITY_META.map((cap) => {
                  const on = formData.capabilities[cap.key];
                  return (
                    <label key={cap.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${on ? 'border-green-300 bg-green-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
                      <input type="checkbox" className="w-5 h-5 mt-0.5 text-green-600 rounded cursor-pointer shrink-0" checked={on} onChange={() => toggleCapability(cap.key)} />
                      <span>
                        <span className={`block text-sm font-bold ${on ? 'text-green-800' : 'text-neutral-700'}`}>{cap.label}</span>
                        <span className="block text-xs text-neutral-500">{cap.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Partner commission — what a partner earns when an owner buys this plan. */}
            <div className="md:col-span-2 bg-neutral-50 p-4 sm:p-6 rounded-2xl border border-neutral-200 mt-2">
              <div className="mb-4 pb-4 border-b border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900">Partner Commission</h3>
                <p className="text-sm text-neutral-500">Owner ye plan le to partner ko kitna mile. Ye earning apne aap ban jaati hai (admin baad mein badal bhi sakta hai).</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Commission type</label>
                  <select className="w-full border rounded-xl p-2.5" value={formData.partnerCommissionType} onChange={e => setFormData({ ...formData, partnerCommissionType: e.target.value })}>
                    <option value="NONE">None (admin manually set karega)</option>
                    <option value="PERCENT">Percent of plan price (%)</option>
                    <option value="FIXED">Fixed amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {formData.partnerCommissionType === "PERCENT" ? "Percent (%)" : formData.partnerCommissionType === "FIXED" ? "Amount (₹)" : "Value"}
                  </label>
                  <input
                    type="number" min={0}
                    disabled={formData.partnerCommissionType === "NONE"}
                    className="w-full border rounded-xl p-2.5 disabled:bg-neutral-100 disabled:text-neutral-400"
                    value={formData.partnerCommissionValue}
                    onChange={e => setFormData({ ...formData, partnerCommissionValue: e.target.value })}
                  />
                </div>
              </div>
              {formData.partnerCommissionType !== "NONE" && formData.price && (
                <p className="text-sm text-green-700 font-semibold mt-3">
                  Is plan par partner ko milega:{" "}
                  ₹{formData.partnerCommissionType === "PERCENT"
                    ? Math.round((parseInt(formData.price || "0") * parseInt(formData.partnerCommissionValue || "0")) / 100)
                    : parseInt(formData.partnerCommissionValue || "0")}
                  {" "}per conversion
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-4 mt-4">
              <button type="submit" className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer">Save Plan</button>
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
