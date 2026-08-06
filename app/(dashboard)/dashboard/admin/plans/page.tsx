"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, ShieldCheck, PowerOff, Power, Star, Clock, Handshake, X, FileText, IndianRupee } from "lucide-react";
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
    quarterlyPrice: "",
    halfYearlyPrice: "",
    yearlyPrice: "",
    maxListings: "",
    maxPhotos: "",
    maxTenants: "",
    features: [] as Feature[],
    capabilities: { ...NO_CAPABILITIES } as PlanCapabilities,
    partnerCommissionType: "NONE",
    partnerCommissionValue: "0",
    partnerCommissionMonths: "0",
    referralBonusDays: "0",
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
        quarterlyPrice: plan.quarterlyPrice ? plan.quarterlyPrice.toString() : "",
        halfYearlyPrice: plan.halfYearlyPrice ? plan.halfYearlyPrice.toString() : "",
        yearlyPrice: plan.yearlyPrice ? plan.yearlyPrice.toString() : "",
        maxListings: plan.maxListings.toString(),
        maxPhotos: plan.maxPhotos.toString(),
        maxTenants: plan.maxTenants ? plan.maxTenants.toString() : "",
        features: Array.isArray(plan.features) ? plan.features : [],
        capabilities: readCapabilities(plan.capabilities),
        partnerCommissionType: plan.partnerCommissionType ?? "NONE",
        partnerCommissionValue: (plan.partnerCommissionValue ?? 0).toString(),
        partnerCommissionMonths: (plan.partnerCommissionMonths ?? 0).toString(),
        referralBonusDays: (plan.referralBonusDays ?? 0).toString(),
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
        quarterlyPrice: "",
        halfYearlyPrice: "",
        yearlyPrice: "",
        maxListings: "",
        maxPhotos: "",
        maxTenants: "",
        features: [],
        capabilities: { ...NO_CAPABILITIES },
        partnerCommissionType: "NONE",
        partnerCommissionValue: "0",
    partnerCommissionMonths: "0",
    referralBonusDays: "0",
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Subscription Plans</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Manage pricing tiers for PG Owners.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="cursor-pointer inline-flex items-center gap-2 h-8 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase tracking-wider font-black transition-colors shrink-0 shadow-sm"
        >
          <Plus size={14} /> Add Plan
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-neutral-200/60 mb-6 relative">
          <button type="button" onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-2xl transition-colors"><X size={16} /></button>
          <h2 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">{editingPlan ? "Edit Plan" : "Create Plan"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Plan Name</label>
                <input required type="text" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs font-semibold focus:ring-1 focus:ring-violet-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Slug</label>
                <input required type="text" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Corner Badge</label>
                <input type="text" maxLength={30} className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Tagline</label>
                <input type="text" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Sort Order</label>
                <input type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} />
              </div>
              <div className="col-span-1 md:col-span-4 mt-1">
                <label className={`flex items-center gap-2 p-2 rounded-2xl border cursor-pointer transition-colors ${formData.recommended ? 'border-violet-300 bg-violet-50/50' : 'border-neutral-200/60 bg-neutral-50/50 hover:bg-neutral-100'}`}>
                  <input type="checkbox" className="w-4 h-4 text-violet-600 rounded cursor-pointer" checked={formData.recommended} onChange={e => setFormData({...formData, recommended: e.target.checked})} />
                  <Star size={14} className={formData.recommended ? 'text-violet-600' : 'text-neutral-400'} />
                  <span className="text-[11px] font-bold text-neutral-800">Mark as Recommended</span>
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Monthly (₹)</label>
                <input required type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs font-bold focus:ring-1 focus:ring-violet-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">3 Months (₹)</label>
                <input type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs font-bold focus:ring-1 focus:ring-violet-500" value={formData.quarterlyPrice} onChange={e => setFormData({...formData, quarterlyPrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">6 Months (₹)</label>
                <input type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs font-bold focus:ring-1 focus:ring-violet-500" value={formData.halfYearlyPrice} onChange={e => setFormData({...formData, halfYearlyPrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Yearly (₹)</label>
                <input type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs font-bold focus:ring-1 focus:ring-violet-500" value={formData.yearlyPrice} onChange={e => setFormData({...formData, yearlyPrice: e.target.value})} />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Max PGs (-1=Unlmt)</label>
                <input required type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.maxListings} onChange={e => setFormData({...formData, maxListings: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Max Tenants (-1=Unlmt)</label>
                <input required type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.maxTenants} onChange={e => setFormData({...formData, maxTenants: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Max Photos</label>
                <input required type="number" className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.maxPhotos} onChange={e => setFormData({...formData, maxPhotos: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capabilities */}
              <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Feature Access (System)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CAPABILITY_META.map((cap) => {
                    const on = formData.capabilities[cap.key];
                    return (
                      <label key={cap.key} className={`flex items-start gap-2 p-2 rounded-2xl border cursor-pointer transition-colors ${on ? 'border-green-300 bg-green-50' : 'border-neutral-100 hover:bg-neutral-50'}`}>
                        <input type="checkbox" className="w-3 h-3 mt-0.5 text-green-600 rounded cursor-pointer shrink-0" checked={on} onChange={() => toggleCapability(cap.key)} />
                        <span className={`block text-[10px] font-bold leading-tight ${on ? 'text-green-800' : 'text-neutral-600'}`}>{cap.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Features Checklist (Display)</h3>
                   <button type="button" onClick={addFeature} className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded transition-colors">+ Add</button>
                 </div>
                 <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-2xl border border-neutral-200/60 bg-neutral-50 focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-100">
                      <input type="text" placeholder="Feature..." className="flex-1 bg-transparent border-none text-[11px] font-bold px-2 py-1 outline-none" value={feat.name} onChange={e => updateFeature(idx, "name", e.target.value)} />
                      <label className="flex items-center gap-1 cursor-pointer shrink-0">
                        <input type="checkbox" className="w-3 h-3 text-emerald-500 rounded" checked={feat.included} onChange={e => updateFeature(idx, "included", e.target.checked)} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${feat.included ? 'text-emerald-600' : 'text-neutral-400'}`}>Inc</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer shrink-0 ml-1 border-l border-neutral-200/60 pl-2">
                        <input type="checkbox" className="w-3 h-3 text-amber-500 rounded" checked={!!feat.comingSoon} onChange={e => updateFeature(idx, "comingSoon", e.target.checked)} />
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${feat.comingSoon ? 'text-amber-600' : 'text-neutral-400'}`}>Soon</span>
                      </label>
                      <button type="button" onClick={() => removeFeature(idx)} className="text-neutral-400 hover:text-red-500 ml-1 p-1"><Trash2 size={13}/></button>
                    </div>
                  ))}
                  {formData.features.length === 0 && <div className="text-[10px] text-neutral-400 italic mt-2">No display features added.</div>}
                 </div>
              </div>
            </div>

            {/* Partner Comm */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-neutral-100">
              <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Comm. Type</label>
                  <select className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.partnerCommissionType} onChange={e => setFormData({ ...formData, partnerCommissionType: e.target.value })}>
                    <option value="NONE">None</option>
                    <option value="PERCENT">Percent (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Value</label>
                  <input type="number" min={0} disabled={formData.partnerCommissionType === "NONE"} className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs disabled:opacity-50 focus:ring-1 focus:ring-violet-500" value={formData.partnerCommissionValue} onChange={e => setFormData({ ...formData, partnerCommissionValue: e.target.value })} />
              </div>
              <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Duration (Months)</label>
                  <select className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.partnerCommissionMonths} onChange={e => setFormData({ ...formData, partnerCommissionMonths: e.target.value })}>
                    <option value="0">Lifetime</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="1">1st Payment</option>
                  </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Ref Bonus (Days)</label>
                  <input type="number" min={0} className="w-full border-neutral-200/60 rounded-2xl p-2 text-xs focus:ring-1 focus:ring-violet-500" value={formData.referralBonusDays} onChange={e => setFormData({ ...formData, referralBonusDays: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="h-8 px-5 rounded-2xl bg-white/60 backdrop-blur-md border border-neutral-200/60 text-neutral-600 text-[11px] font-bold hover:bg-neutral-50 transition-colors uppercase tracking-wider">Cancel</button>
              <button type="submit" className="h-8 px-5 rounded-2xl bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-colors uppercase tracking-wider shadow-sm">Save Plan</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 size={24} className="animate-spin text-neutral-300" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white/60 backdrop-blur-md flex flex-col rounded-2xl border shadow-sm ${!plan.isActive ? 'opacity-60 grayscale' : 'border-neutral-200/60 hover:border-violet-300 hover:shadow-md transition-all'}`}>
              <div className="p-4 border-b border-neutral-100/60 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-neutral-900 leading-tight">{plan.name}</h3>
                    {plan.recommended && <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">Hot</span>}
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{plan.slug}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-neutral-900">₹{plan.price}</div>
                  <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">/ mo</div>
                </div>
              </div>
              <div className="p-4 flex-1">
                {plan.tagline && <p className="text-[11px] font-medium text-neutral-500 mb-3 leading-tight">{plan.tagline}</p>}
                
                {/* Pricing Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4 bg-neutral-50/50 p-2 rounded-xl border border-neutral-100/50 text-center">
                  <div>
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">3 Months</div>
                    <div className="text-[11px] font-black text-neutral-700 mt-0.5">{plan.quarterlyPrice ? `₹${plan.quarterlyPrice}` : '—'}</div>
                  </div>
                  <div className="border-l border-neutral-200/60">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">6 Months</div>
                    <div className="text-[11px] font-black text-neutral-700 mt-0.5">{plan.halfYearlyPrice ? `₹${plan.halfYearlyPrice}` : '—'}</div>
                  </div>
                  <div className="border-l border-neutral-200/60">
                    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Yearly</div>
                    <div className="text-[11px] font-black text-neutral-700 mt-0.5">{plan.yearlyPrice ? `₹${plan.yearlyPrice}` : '—'}</div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] font-bold text-neutral-600 mb-4">
                  <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-emerald-500" /> {plan.maxListings === -1 ? 'Unlimited PGs' : `Up to ${plan.maxListings} PGs`}</div>
                  <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-emerald-500" /> {plan.maxTenants === -1 ? 'Unlimited Tenants' : `Up to ${plan.maxTenants} Tenants`}</div>
                  <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-emerald-500" /> {plan.maxPhotos} Photos allowed</div>
                  {plan.features?.map((f: Feature, i: number) => (
                    <div key={i} className={`flex items-start gap-2 ${f.included ? '' : 'opacity-40 line-through'}`}>
                      <ShieldCheck size={13} className={f.included ? 'text-emerald-500' : 'text-neutral-400'} />
                      <span>{f.name} {f.comingSoon && <span className="text-[9px] text-amber-500 uppercase tracking-wider ml-1">Soon</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50/50 p-3 flex flex-col gap-2 border-t border-neutral-100/60">
                <div className="flex flex-col gap-0.5">
                  {plan.partnerCommissionType !== 'NONE' && (
                    <div className="text-[10px] font-extrabold text-violet-700 flex items-center gap-1 uppercase tracking-wider">
                      <Handshake size={10} /> Comm: {plan.partnerCommissionType === 'PERCENT' ? `${plan.partnerCommissionValue}%` : `₹${plan.partnerCommissionValue}`} {plan.partnerCommissionMonths === 0 ? '(Life)' : `(${plan.partnerCommissionMonths}m)`}
                    </div>
                  )}
                  {plan.referralBonusDays > 0 && (
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                      <Star size={10} /> +{plan.referralBonusDays} Days Bonus
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 pt-2 border-t border-neutral-200/50">
                  <button onClick={() => handleOpenForm(plan)} className="flex-1 p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold text-xs flex justify-center transition-colors"><Edit size={13} /></button>
                  <button onClick={() => toggleStatus(plan)} className={`flex-1 p-1.5 rounded-xl text-xs font-bold flex justify-center transition-colors ${plan.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {plan.isActive ? <PowerOff size={13} /> : <Power size={13} />}
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="flex-1 p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-xs flex justify-center transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
