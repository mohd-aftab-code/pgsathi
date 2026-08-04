"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, CheckCircle2, Upload, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LocationStep, validateLocation } from "@/components/listings/LocationStep";

// ════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════
type StepType = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { id: 1, title: "Room Details" },
  { id: 2, title: "Location Details" },
  { id: 3, title: "PG Details" },
  { id: 4, title: "Amenities Details" },
  { id: 5, title: "Gallery & Pricing" },
];

const AMENITIES_LIST = [
  { id: "power_backup", label: "Power Back Up", icon: "zap" },
  { id: "lift", label: "Lift", icon: "arrow-up-down" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi" },
  { id: "water_cooler", label: "Water Cooler", icon: "droplet" },
  { id: "fridge", label: "Fridge", icon: "snowflake" },
  { id: "microwave", label: "Microwave", icon: "waves" },
  { id: "first_aid", label: "First Aid Kit", icon: "cross" },
  { id: "warden", label: "Warden / Manager", icon: "user" },
  { id: "security", label: "Security Guard", icon: "shield" },
  { id: "gym", label: "Gym", icon: "dumbbell" },
];

const ROOM_AMENITIES_LIST = [
  { id: "tv", label: "Television", icon: "tv" },
  { id: "bed", label: "Single Bed", icon: "bed" },
  { id: "ac", label: "AC / Heating", icon: "thermometer" },
  { id: "mattress", label: "Mattress + Pillow", icon: "layout" },
  { id: "table", label: "Table + Chair", icon: "monitor" },
  { id: "blanket", label: "Blanket / Quilt", icon: "square" },
  { id: "cupboard", label: "Cupboard", icon: "archive" },
];

const DRAFT_KEY = "pgsathi_new_listing_draft";

// Defined at module level so TypeScript can infer FormData type
const DEFAULT_FORM = {
  // Step 1: Basic
  title: "",
  description: "",
  roomTypes: ["SINGLE_ROOM"],
  genderAllowed: "BOYS",
  
  // Step 2: Location — plain text the owner types; the server turns
  // pincode/city/state into the real City row when the listing is saved.
  localityId: "",
  cityName: "",
  stateName: "",
  areaLocality: "",
  address: "",
  pincode: "",
  landmark: "",
  latitude: null as number | null,
  longitude: null as number | null,

  // Step 3: PG Details
  noticePeriod: "No",
  foodIncluded: "No",
  gateClosingTime: "No",
  preferredGuest: "Both",
  rentLockIn: true,
  noGuardiansStay: true,

  // Step 4: Amenities
  laundryService: "No",
  roomCleaning: "No",
  parking: "No",
  selectedAmenities: [] as string[],
  selectedRoomAmenities: [] as string[],

  // Step 5: Pricing
  roomPrices: {} as Record<string, { rent: string; deposit: string }>,
  electricityCharge: "",
  maintenanceCharge: "",
  foodCharge: "",
  setupFee: "",
  photos: [] as { url: string; publicId: string }[],
  
  // Internal: track auto-filled address from map
  _autoAddress: "",
};

type FormData = typeof DEFAULT_FORM;

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  // Start from SSR-safe defaults — reading localStorage here would make the
  // client's first render diverge from the server-rendered HTML (hydration
  // mismatch). The saved draft is restored client-side after mount instead.
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  // Gates the auto-save effect below until the restore below has applied —
  // it's state (not a ref) so the gate flips in the same batched re-render
  // as the restored values, instead of one render pass ahead of them.
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore saved draft from localStorage once, after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep as StepType);
        if (parsed.formData) setFormData({ ...DEFAULT_FORM, ...parsed.formData });
      }
    } catch {}
    setHasRestoredDraft(true);
  }, []);

  // Auto-save draft to localStorage on every change (skip until the restore
  // above has applied, otherwise this would overwrite the saved draft with defaults)
  useEffect(() => {
    if (!hasRestoredDraft) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ currentStep, formData }));
    } catch {}
  }, [hasRestoredDraft, currentStep, formData]);

  /** Per-step validation, so nobody reaches step 5 only to be told step 1 is empty. */
  const validateStep = (step: StepType): string | null => {
    if (step === 1) {
      if (!formData.title.trim()) return "PG / Flat ka naam daalein.";
      if (!formData.description.trim()) return "Ek chhota description daalein.";
      if (formData.roomTypes.length === 0) return "Kam se kam ek room type chunein.";
    }
    // Shared with the edit page so both reject the same things in the same words
    if (step === 2) return validateLocation(formData);
    if (step === 5) {
      if (formData.photos.length === 0) return "Please upload at least one photo.";
      for (const rt of formData.roomTypes) {
        if (!formData.roomPrices[rt]?.rent) return "Har selected room type ka monthly rent daalein.";
      }
    }
    return null;
  };

  const handleNext = () => {
    const problem = validateStep(currentStep);
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as StepType);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as StepType);
  };

  const toggleAmenity = (id: string, type: 'pg' | 'room') => {
    if (type === 'pg') {
      setFormData(prev => ({
        ...prev,
        selectedAmenities: prev.selectedAmenities.includes(id) 
          ? prev.selectedAmenities.filter(a => a !== id)
          : [...prev.selectedAmenities, id]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedRoomAmenities: prev.selectedRoomAmenities.includes(id) 
          ? prev.selectedRoomAmenities.filter(a => a !== id)
          : [...prev.selectedRoomAmenities, id]
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    setError("");

    try {
      const files = Array.from(e.target.files);
      const uploaded: { url: string; publicId: string }[] = [];

      for (const file of files) {
        const fileData = new FormData();
        fileData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });
        const data = await res.json();
        if (data.success) {
          uploaded.push({ url: data.url, publicId: data.publicId });
        }
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploaded]
      }));
    } catch (error) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setError("");

    // Re-check every step, and send the owner back to the one that's incomplete
    // rather than showing an error about a step they can't see.
    for (const step of [1, 2, 5] as StepType[]) {
      const problem = validateStep(step);
      if (problem) {
        setError(`Step ${step}: ${problem}`);
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setLoading(true);

    let minRent = Infinity;
    let maxRent = 0;
    for (const rt of formData.roomTypes) {
      const rent = parseInt(formData.roomPrices[rt]?.rent || "0") || 0;
      if (rent < minRent) minRent = rent;
      if (rent > maxRent) maxRent = rent;
    }

    try {
      // Create a clean payload mapping to our backend schema
      const payload = {
        title: formData.title,
        description: formData.description,
        roomTypes: formData.roomTypes,
        genderAllowed: formData.genderAllowed,
        // The server resolves (and if needed creates) the City row from these —
        // the client no longer needs to know a cityId at all.
        cityName: formData.cityName.trim(),
        stateName: formData.stateName.trim(),
        localityId: formData.localityId ? parseInt(formData.localityId) : null,
        areaLocality: formData.areaLocality.trim() || null,
        address: formData.address,
        pincode: formData.pincode,
        landmark: formData.landmark,
        latitude: formData.latitude,
        longitude: formData.longitude,
        priceMin: minRent === Infinity ? 0 : minRent,
        priceMax: maxRent,
        roomPrices: formData.roomPrices,
        electricityCharge: formData.electricityCharge ? parseInt(formData.electricityCharge) : null,
        maintenanceCharge: formData.maintenanceCharge ? parseInt(formData.maintenanceCharge) : null,
        foodCharge: formData.foodCharge ? parseInt(formData.foodCharge) : null,
        setupFee: formData.setupFee ? parseInt(formData.setupFee) : null,
        foodIncluded: formData.foodIncluded === "Yes",
        noticePeriod: formData.noticePeriod === "Yes",
        gateClosingTime: formData.gateClosingTime === "Yes",
        rentLockIn: formData.rentLockIn,
        noGuardiansStay: formData.noGuardiansStay,
        laundryService: formData.laundryService === "Yes",
        roomCleaning: formData.roomCleaning === "Yes",
        parking: formData.parking === "Yes",
        photos: formData.photos,
        amenities: [...formData.selectedAmenities, ...formData.selectedRoomAmenities],
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        // Clear saved draft on success
        localStorage.removeItem(DRAFT_KEY);
        router.push("/dashboard/owner/listings");
      } else {
        console.error("Listing Creation Error:", data);
        setError(data.message || "Failed to create listing");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ════════════════════════════════════════════════════════

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (isCompleted || isActive) setCurrentStep(step.id as StepType);
              }}
              className={`flex items-center gap-2.5 p-2.5 md:p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20 font-bold"
                  : isCompleted
                  ? "bg-violet-50 text-violet-800 border-violet-200/80 font-semibold hover:bg-violet-100/80"
                  : "bg-white text-neutral-400 border-neutral-200 cursor-not-allowed opacity-80"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isCompleted
                    ? "bg-violet-200/60 text-violet-800"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : step.id}
              </div>
              <span className="text-xs truncate">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">PG / Flat Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
              placeholder="e.g. Sharma Boys PG"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
              placeholder="Short catchy description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Available for <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {['BOYS', 'GIRLS', 'COED'].map(type => (
                <label key={type} className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  formData.genderAllowed === type 
                    ? 'border-violet-500 bg-violet-50 text-violet-700' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="gender" className="hidden" checked={formData.genderAllowed === type} onChange={() => setFormData({...formData, genderAllowed: type})} />
                  {type === 'COED' ? 'Co-living' : type === 'BOYS' ? '♂ Boys' : '♀ Girls'}
                </label>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Room Types <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "SINGLE_ROOM", label: "Single Room" },
                { id: "DOUBLE_SHARING", label: "Double Sharing" },
                { id: "TRIPLE_SHARING", label: "Triple Sharing" },
                { id: "ENTIRE_FLAT", label: "Entire Flat" },
                { id: "DORMITORY", label: "Dormitory" },
                { id: "STUDIO", label: "Studio" },
              ].map((type) => (
                <label key={type.id} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  formData.roomTypes.includes(type.id)
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}>
                  <input type="checkbox" className="hidden" checked={formData.roomTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, roomTypes: [...formData.roomTypes, type.id] });
                      } else {
                        if (formData.roomTypes.length > 1) {
                          setFormData({ ...formData, roomTypes: formData.roomTypes.filter(id => id !== type.id) });
                        }
                      }
                    }}
                  />
                  {formData.roomTypes.includes(type.id) && <CheckCircle2 size={13} />}
                  {type.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <LocationStep
      value={{
        stateName: formData.stateName, cityName: formData.cityName,
        pincode: formData.pincode, areaLocality: formData.areaLocality,
        localityId: formData.localityId, address: formData.address,
        landmark: formData.landmark,
        latitude: formData.latitude, longitude: formData.longitude,
      }}
      onChange={(patch) => setFormData(prev => ({ ...prev, ...patch }))}
    />
  );

  const renderStep3 = () => {
    const tog2 = (label: string, value: string, field: keyof typeof formData) => (
      <div key={label}>
        <p className="text-sm font-medium text-neutral-700 mb-2">{label}</p>
        <div className="flex gap-2">
          {['Yes', 'No'].map(opt => (
            <label key={opt} className={`flex-1 flex items-center justify-center h-9 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
              (formData[field] as string) === opt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}>
              <input type="radio" className="hidden" checked={(formData[field] as string) === opt} onChange={() => setFormData({...formData, [field]: opt})} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">PG Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            {tog2('Notice Period', formData.noticePeriod, 'noticePeriod')}
            {tog2('Food Included', formData.foodIncluded, 'foodIncluded')}
            {tog2('Gate Closing Time', formData.gateClosingTime, 'gateClosingTime')}
          </div>
          <p className="text-sm font-medium text-neutral-700 mb-2">PG Rules</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'rentLockIn', label: 'Rent Lock-in' },
              { key: 'noGuardiansStay', label: 'No Guardians Stay' },
            ].map(({ key, label }) => {
              const checked = formData[key as keyof typeof formData] as boolean;
              return (
                <label key={key} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  checked ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}>
                  <input type="checkbox" className="hidden" checked={checked} onChange={(e) => setFormData({...formData, [key]: e.target.checked})} />
                  {checked && <CheckCircle2 size={13} />}
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Laundry Service', field: 'laundryService', name: 'laundry' },
            { label: 'Room Cleaning', field: 'roomCleaning', name: 'cleaning' },
            { label: 'Parking', field: 'parking', name: 'parking' },
          ].map(({ label, field, name }) => (
            <div key={field}>
              <p className="text-sm font-medium text-neutral-700 mb-2">{label}</p>
              <div className="flex gap-2">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className={`flex-1 flex items-center justify-center h-9 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                    (formData[field as keyof typeof formData] as string) === opt
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}>
                    <input type="radio" name={name} className="hidden" checked={(formData[field as keyof typeof formData] as string) === opt} onChange={() => setFormData({...formData, [field]: opt})} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">PG Amenities</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {AMENITIES_LIST.map(amenity => {
            const isSelected = formData.selectedAmenities.includes(amenity.id);
            return (
              <label key={amenity.id} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                isSelected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}>
                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAmenity(amenity.id, 'pg')} />
                {isSelected && <CheckCircle2 size={13} />}
                {amenity.label}
              </label>
            );
          })}
        </div>

        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Room Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {ROOM_AMENITIES_LIST.map(amenity => {
            const isSelected = formData.selectedRoomAmenities.includes(amenity.id);
            return (
              <label key={amenity.id} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                isSelected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}>
                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAmenity(amenity.id, 'room')} />
                {isSelected && <CheckCircle2 size={13} />}
                {amenity.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      
      {/* Gallery */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Photos</h3>
        
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
            {formData.photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                <img src={photo.url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-neutral-200 hover:border-violet-400 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-colors group">
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
            {uploadingImage ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} />}
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-sm">{uploadingImage ? "Uploading..." : "Click to Upload Photos"}</p>
            <p className="text-xs text-neutral-400">Multiple images allowed · Max 5MB each</p>
          </div>
        </label>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 md:p-6">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Pricing</h3>
        <p className="text-xs text-neutral-400 mb-4">Set rent and deposit for each room type.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {formData.roomTypes.map(rt => {
            const labelMap: Record<string, string> = {
              "SINGLE_ROOM": "Single Room",
              "DOUBLE_SHARING": "Double Sharing",
              "TRIPLE_SHARING": "Triple Sharing",
              "DORMITORY": "Dormitory",
              "STUDIO": "Studio",
              "ENTIRE_FLAT": "Entire Flat",
            };
            const label = labelMap[rt] || rt;
            const currentRent = formData.roomPrices[rt]?.rent || "";
            const currentDeposit = formData.roomPrices[rt]?.deposit || "";

            return (
              <div key={rt} className="border border-neutral-200 rounded-xl p-4">
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">{label}</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Rent (₹/mo) *</label>
                    <input type="number" className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors" placeholder="e.g. 8000" value={currentRent} 
                      onChange={e => setFormData({ ...formData, roomPrices: { ...formData.roomPrices, [rt]: { ...formData.roomPrices[rt], rent: e.target.value, deposit: currentDeposit } } })} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Deposit (₹)</label>
                    <input type="number" className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors" placeholder="e.g. 10000" value={currentDeposit} 
                      onChange={e => setFormData({ ...formData, roomPrices: { ...formData.roomPrices, [rt]: { ...formData.roomPrices[rt], rent: currentRent, deposit: e.target.value } } })} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Additional Charges (Optional)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Maintenance (₹/mo)', field: 'maintenanceCharge' },
            { label: 'Electricity (₹/mo)', field: 'electricityCharge' },
            { label: 'Food / Mess (₹/mo)', field: 'foodCharge' },
            { label: 'Setup Fee (one-time)', field: 'setupFee' },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-xs text-neutral-500 mb-1">{label}</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors" value={formData[field as keyof typeof formData] as string} onChange={e => setFormData({...formData, [field]: e.target.value})} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    // pb-52 on mobile: the action bar AND the app's bottom tab bar both sit at
    // the bottom of the viewport there, so content needs to clear both.
    <div className="max-w-6xl mx-auto pb-44 md:pb-20 px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/owner/listings" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-neutral-600 shadow-2xs border border-neutral-200 hover:text-violet-700 hover:border-violet-300 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900">List Your Property</h1>
            <p className="text-neutral-500 text-xs sm:text-sm">
              ✅ Draft auto-saved — fill in the details, live after verification
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Start fresh? All filled data will be cleared.")) {
              localStorage.removeItem(DRAFT_KEY);
              window.location.reload();
            }
          }}
          className="text-xs text-neutral-400 hover:text-red-500 border border-neutral-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Clear Draft
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium border border-red-100 mb-4">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {renderStepIndicator()}

      {/* Form Area */}
      <div className="mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      {/* Sticky Bottom Navigation Buttons */}
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 md:relative md:bottom-auto bg-white md:bg-transparent border-t border-neutral-200 md:border-t-0 p-4 md:p-0 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] md:shadow-none flex items-center justify-between gap-3 md:pt-4">
        <button 
          type="button" 
          onClick={handlePrev}
          className={`px-6 md:px-8 py-3 rounded-xl font-bold border transition-all shadow-2xs ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 hover:shadow-sm'}`}
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-extrabold transition-all shadow-md shadow-violet-500/20 hover:scale-[1.01]"
          >
            Save & Continue
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-700 hover:from-violet-800 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-extrabold transition-all shadow-md shadow-violet-600/25 hover:scale-[1.01] flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : "Submit & Publish"}
          </button>
        )}
      </div>

    </div>
  );
}
