"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";




interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const [listingId, setListingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pgType: "SINGLE_ROOM",
    genderAllowed: "BOYS",
    cityId: "",
    localityId: "",
    address: "",
    pincode: "",
    landmark: "",
    priceMin: "",
    priceMax: "",
    securityDeposit: "",
    electricityCharge: "",
    maintenanceCharge: "",
    foodCharge: "",
    setupFee: "",
    foodIncluded: false,
    noticePeriod: false,
    gateClosingTime: false,
    rentLockIn: false,
    noGuardiansStay: false,
    laundryService: false,
    roomCleaning: false,
    parking: false,
  });

  // Resolve params and fetch listing
  useEffect(() => {
    params.then(p => {
      setListingId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!listingId) return;
    
    // Fetch listing data
    fetch(`/api/listings/${listingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const l = data.data;
          setFormData({
            title: l.title || "",
            description: l.description || "",
            pgType: l.pgType || "SINGLE_ROOM",
            genderAllowed: l.genderAllowed || "BOYS",
            cityId: l.cityId?.toString() || "",
            localityId: l.localityId?.toString() || "",
            address: l.address || "",
            pincode: l.pincode || "",
            landmark: l.landmark || "",
            priceMin: l.priceMin?.toString() || "",
            priceMax: l.priceMax?.toString() || "",
            securityDeposit: l.securityDeposit?.toString() || "",
            electricityCharge: l.electricityCharge?.toString() || "",
            maintenanceCharge: l.maintenanceCharge?.toString() || "",
            foodCharge: l.foodCharge?.toString() || "",
            setupFee: l.setupFee?.toString() || "",
            foodIncluded: l.foodIncluded || false,
            noticePeriod: l.noticePeriod || false,
            gateClosingTime: l.gateClosingTime || false,
            rentLockIn: l.rentLockIn || false,
            noGuardiansStay: l.noGuardiansStay || false,
            laundryService: l.laundryService || false,
            roomCleaning: l.roomCleaning || false,
            parking: l.parking || false,
          });
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));

    // Fetch cities
    fetch("/api/cities?localities=true")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCities(data.data);
      });
  }, [listingId]);

  // Update localities when cityId changes
  useEffect(() => {
    if (formData.cityId) {
      const selectedCity = cities.find(c => c.id.toString() === formData.cityId);
      setLocalities(selectedCity?.localities || []);
    }
  }, [formData.cityId, cities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        pgType: formData.pgType,
        genderAllowed: formData.genderAllowed,
        cityId: parseInt(formData.cityId),
        localityId: formData.localityId ? parseInt(formData.localityId) : null,
        address: formData.address,
        pincode: formData.pincode,
        landmark: formData.landmark,
        priceMin: parseInt(formData.priceMin) || 0,
        priceMax: parseInt(formData.priceMax) || 0,
        securityDeposit: formData.securityDeposit ? parseInt(formData.securityDeposit) : null,
        electricityCharge: formData.electricityCharge ? parseInt(formData.electricityCharge) : null,
        maintenanceCharge: formData.maintenanceCharge ? parseInt(formData.maintenanceCharge) : null,
        foodCharge: formData.foodCharge ? parseInt(formData.foodCharge) : null,
        setupFee: formData.setupFee ? parseInt(formData.setupFee) : null,
        foodIncluded: formData.foodIncluded,
        noticePeriod: formData.noticePeriod,
        gateClosingTime: formData.gateClosingTime,
        rentLockIn: formData.rentLockIn,
        noGuardiansStay: formData.noGuardiansStay,
        laundryService: formData.laundryService,
        roomCleaning: formData.roomCleaning,
        parking: formData.parking,
      };

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/owner/listings"), 1500);
      } else {
        setError(data.message || "Update karne mein problem aayi.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-500 mx-auto mb-3" size={36} />
          <p className="text-neutral-500">Loading listing data...</p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white";
  const labelCls = "block text-sm font-semibold text-neutral-700 mb-2";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/owner/listings"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-500 shadow-sm border border-neutral-200 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Edit Listing</h1>
          <p className="text-neutral-500 text-sm">Changes save hone ke baad admin review ke liye jayenge.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-semibold border border-green-100 mb-6 flex items-center gap-2">
          <CheckCircle2 size={18} /> Listing update ho gayi! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>PG / Flat Name *</label>
              <input type="text" className={inputCls} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>PG Type *</label>
              <select className={inputCls} value={formData.pgType} onChange={e => setFormData({ ...formData, pgType: e.target.value })}>
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="DOUBLE_SHARING">Double Sharing</option>
                <option value="TRIPLE_SHARING">Triple Sharing</option>
                <option value="ENTIRE_FLAT">Entire Flat</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Available For *</label>
              <div className="flex items-center gap-6 mt-3">
                {['BOYS', 'GIRLS', 'COED'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" className="w-4 h-4 text-primary-500" checked={formData.genderAllowed === type} onChange={() => setFormData({ ...formData, genderAllowed: type })} />
                    <span className="text-sm font-medium">{type === 'COED' ? 'Co-living' : type === 'BOYS' ? 'Boys' : 'Girls'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>City *</label>
              <select className={inputCls} value={formData.cityId} onChange={e => {
                const cityId = e.target.value;
                setFormData({ ...formData, cityId, localityId: "" });
                const selectedCity = cities.find(c => c.id.toString() === cityId);
                setLocalities(selectedCity?.localities || []);
              }}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Locality</label>
              <select className={inputCls} value={formData.localityId} onChange={e => setFormData({ ...formData, localityId: e.target.value })} disabled={!formData.cityId}>
                <option value="">Select Locality</option>
                {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Complete Address *</label>
              <textarea rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Landmark / Street</label>
              <input type="text" className={inputCls} placeholder="Near Apollo Hospital" value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Pincode *</label>
              <input type="text" className={inputCls} placeholder="110001" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} required />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Pricing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelCls}>Min Rent (₹/mo) *</label>
              <input type="number" className={inputCls} value={formData.priceMin} onChange={e => setFormData({ ...formData, priceMin: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Max Rent (₹/mo) *</label>
              <input type="number" className={inputCls} value={formData.priceMax} onChange={e => setFormData({ ...formData, priceMax: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Security Deposit (₹)</label>
              <input type="number" className={inputCls} value={formData.securityDeposit} onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })} />
            </div>
          </div>
          <h4 className="text-sm font-bold text-neutral-700 mb-4">Additional Charges (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelCls}>Maintenance (₹/mo)</label>
              <input type="number" className={inputCls} value={formData.maintenanceCharge} onChange={e => setFormData({ ...formData, maintenanceCharge: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Electricity (₹/mo)</label>
              <input type="number" className={inputCls} value={formData.electricityCharge} onChange={e => setFormData({ ...formData, electricityCharge: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Food / Mess (₹/mo)</label>
              <input type="number" className={inputCls} value={formData.foodCharge} onChange={e => setFormData({ ...formData, foodCharge: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Setup Fee (One-time)</label>
              <input type="number" className={inputCls} value={formData.setupFee} onChange={e => setFormData({ ...formData, setupFee: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Rules & Services */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Rules & Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "foodIncluded", label: "Food Included" },
              { key: "noticePeriod", label: "Notice Period" },
              { key: "gateClosingTime", label: "Gate Closing" },
              { key: "rentLockIn", label: "Rent Lock-In" },
              { key: "noGuardiansStay", label: "No Guardians Stay" },
              { key: "laundryService", label: "Laundry Service" },
              { key: "roomCleaning", label: "Room Cleaning" },
              { key: "parking", label: "Parking Available" },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer bg-neutral-50 p-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 rounded"
                  checked={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                />
                <span className="text-sm font-medium text-neutral-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link href="/dashboard/owner/listings" className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary-500/25"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
