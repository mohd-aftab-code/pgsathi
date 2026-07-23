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
  availableFrom: "",
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
      if (formData.photos.length === 0) return "Kam se kam ek photo upload karein.";
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
    <div className="flex w-full mb-10 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex w-full min-w-[600px] justify-between relative px-2">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-neutral-100 -translate-y-1/2 rounded-full z-0"></div>
        <div className="absolute top-1/2 left-4 h-1 bg-primary-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500" style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }}></div>
        
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                ${isActive ? 'bg-primary-500 text-white ring-4 ring-primary-100 scale-110' : 
                  isCompleted ? 'bg-primary-100 text-primary-600' : 
                  'bg-white text-neutral-400 border border-neutral-200'}`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : step.id}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'text-neutral-900' : isCompleted ? 'text-primary-700' : 'text-neutral-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Provide Details of PG</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">PG / Flat Name *</label>
            <input 
              type="text" 
              className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              placeholder="Enter PG Name"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Description *</label>
            <input 
              type="text" 
              className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              placeholder="Short catchy description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Place is available for *</label>
            <div className="grid grid-cols-3 gap-4">
              {['BOYS', 'GIRLS', 'COED'].map(type => (
                <label key={type} className={`relative flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.genderAllowed === type ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input 
                    type="radio" 
                    name="gender" 
                    className="hidden"
                    checked={formData.genderAllowed === type}
                    onChange={() => setFormData({...formData, genderAllowed: type})}
                  />
                  <span className="text-sm font-bold">{type === 'COED' ? 'Co-living' : type === 'BOYS' ? 'Boys' : 'Girls'}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Room Types Available *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[
                { id: "SINGLE_ROOM", label: "Single Room" },
                { id: "DOUBLE_SHARING", label: "Double Sharing" },
                { id: "TRIPLE_SHARING", label: "Triple Sharing" },
                { id: "ENTIRE_FLAT", label: "Entire Flat" },
                { id: "DORMITORY", label: "Dormitory" },
                { id: "STUDIO", label: "Studio" },
              ].map((type) => (
                <label key={type.id} className={`relative flex items-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.roomTypes.includes(type.id) ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-3 shrink-0 transition-colors ${formData.roomTypes.includes(type.id) ? 'bg-primary-500 border-primary-500' : 'border-2 border-neutral-300'}`}>
                    {formData.roomTypes.includes(type.id) && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData.roomTypes.includes(type.id)}
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
                  <span className={`text-sm font-bold ${formData.roomTypes.includes(type.id) ? 'text-primary-800' : 'text-neutral-600'}`}>{type.label}</span>
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

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Provide Details of PG</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Available From *</label>
            <input 
              type="date" 
              className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              value={formData.availableFrom}
              onChange={e => setFormData({...formData, availableFrom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Notice Period</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.noticePeriod === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input 
                    type="radio" 
                    name="noticePeriod" 
                    className="hidden"
                    checked={formData.noticePeriod === opt}
                    onChange={() => setFormData({...formData, noticePeriod: opt})}
                  />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Food Included</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.foodIncluded === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input 
                    type="radio" 
                    name="foodIncluded" 
                    className="hidden"
                    checked={formData.foodIncluded === opt}
                    onChange={() => setFormData({...formData, foodIncluded: opt})}
                  />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Gate Closing Time</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.gateClosingTime === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input 
                    type="radio" 
                    name="gateClosingTime" 
                    className="hidden"
                    checked={formData.gateClosingTime === opt}
                    onChange={() => setFormData({...formData, gateClosingTime: opt})}
                  />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">PG Rules</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <label className={`relative flex items-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.rentLockIn ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center mr-3 shrink-0 transition-colors ${formData.rentLockIn ? 'bg-primary-500 border-primary-500' : 'border-2 border-neutral-300'}`}>
                  {formData.rentLockIn && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={formData.rentLockIn}
                  onChange={(e) => setFormData({...formData, rentLockIn: e.target.checked})}
                />
                <span className={`text-sm font-bold ${formData.rentLockIn ? 'text-primary-800' : 'text-neutral-600'}`}>Rent lock-in</span>
              </label>
              <label className={`relative flex items-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.noGuardiansStay ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center mr-3 shrink-0 transition-colors ${formData.noGuardiansStay ? 'bg-primary-500 border-primary-500' : 'border-2 border-neutral-300'}`}>
                  {formData.noGuardiansStay && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={formData.noGuardiansStay}
                  onChange={(e) => setFormData({...formData, noGuardiansStay: e.target.checked})}
                />
                <span className={`text-sm font-bold ${formData.noGuardiansStay ? 'text-primary-800' : 'text-neutral-600'}`}>No guardians stay</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Laundry Service</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.laundryService === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input type="radio" name="laundry" className="hidden" checked={formData.laundryService === opt} onChange={() => setFormData({...formData, laundryService: opt})} />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Room Cleaning</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.roomCleaning === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input type="radio" name="cleaning" className="hidden" checked={formData.roomCleaning === opt} onChange={() => setFormData({...formData, roomCleaning: opt})} />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Parking</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.parking === opt ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}>
                  <input type="radio" name="parking" className="hidden" checked={formData.parking === opt} onChange={() => setFormData({...formData, parking: opt})} />
                  <span className="text-sm font-bold">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Available Amenities of PG</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {AMENITIES_LIST.map(amenity => {
            const isSelected = formData.selectedAmenities.includes(amenity.id);
            return (
              <label key={amenity.id} className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center ${isSelected ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-500' : 'bg-neutral-200'}`}>
                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={isSelected}
                  onChange={() => toggleAmenity(amenity.id, 'pg')}
                />
                <span className={`text-sm font-bold mt-2 ${isSelected ? 'text-primary-800' : 'text-neutral-600'}`}>{amenity.label}</span>
              </label>
            );
          })}
        </div>

        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Room Amenities of PG</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {ROOM_AMENITIES_LIST.map(amenity => {
            const isSelected = formData.selectedRoomAmenities.includes(amenity.id);
            return (
              <label key={amenity.id} className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center ${isSelected ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'}`}>
                <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-500' : 'bg-neutral-200'}`}>
                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={isSelected}
                  onChange={() => toggleAmenity(amenity.id, 'room')}
                />
                <span className={`text-sm font-bold mt-2 ${isSelected ? 'text-primary-800' : 'text-neutral-600'}`}>{amenity.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Gallery */}
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-100">Gallery</h3>
        
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {formData.photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-neutral-100 group shadow-sm hover:shadow-md transition-shadow">
                <img src={photo.url} alt={`Upload ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg scale-90 group-hover:scale-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-primary-300 bg-primary-50/50 hover:bg-primary-50 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative group">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
            disabled={uploadingImage}
          />
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300 text-primary-500">
            {uploadingImage ? (
               <Loader2 className="animate-spin" size={28} />
            ) : (
               <Upload size={28} />
            )}
          </div>
          <p className="font-bold text-neutral-900 mb-1 text-lg">{uploadingImage ? "Uploading..." : "Click to Upload Photos"}</p>
          <p className="text-sm text-neutral-500 mb-6">Upload multiple high-quality images of your property</p>
          <div className="bg-primary-500 text-white font-bold px-8 py-3 rounded-xl shadow-sm text-sm hover:bg-primary-600 transition-colors">Browse Files</div>
          <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-wider font-semibold">Max size 5MB per image</p>
        </label>
      </div>

      {/* Pricing */}
      <div className="border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black text-neutral-900 mb-2">Pricing per Room Type</h3>
        <p className="text-sm text-neutral-500 mb-8 pb-4 border-b border-neutral-100">Set the monthly rent and security deposit for each room type you selected.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <div key={rt} className="border-2 border-neutral-100 rounded-2xl p-5 bg-neutral-50/30">
                <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary-500"></div> {label}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Rent (₹/mo) *</label>
                    <input 
                      type="number" 
                      className="w-full h-12 px-3 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm" 
                      placeholder="e.g. 8000"
                      value={currentRent} 
                      onChange={e => setFormData({
                        ...formData, 
                        roomPrices: { 
                          ...formData.roomPrices, 
                          [rt]: { ...formData.roomPrices[rt], rent: e.target.value, deposit: currentDeposit } 
                        }
                      })} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Deposit (₹)</label>
                    <input 
                      type="number" 
                      className="w-full h-12 px-3 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm" 
                      placeholder="e.g. 10000"
                      value={currentDeposit} 
                      onChange={e => setFormData({
                        ...formData, 
                        roomPrices: { 
                          ...formData.roomPrices, 
                          [rt]: { ...formData.roomPrices[rt], rent: currentRent, deposit: e.target.value } 
                        }
                      })} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <h3 className="text-sm font-bold text-neutral-800 mb-6 uppercase tracking-wider">Additional Charges (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Maintenance (₹/mo)</label>
            <input type="number" className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm" value={formData.maintenanceCharge} onChange={e => setFormData({...formData, maintenanceCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Electricity (₹/mo)</label>
            <input type="number" className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm" value={formData.electricityCharge} onChange={e => setFormData({...formData, electricityCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Food / Mess (₹/mo)</label>
            <input type="number" className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm" value={formData.foodCharge} onChange={e => setFormData({...formData, foodCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Setup Fee (One-time)</label>
            <input type="number" className="w-full h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm" value={formData.setupFee} onChange={e => setFormData({...formData, setupFee: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // pb-52 on mobile: the action bar AND the app's bottom tab bar both sit at
    // the bottom of the viewport there, so content needs to clear both.
    <div className="max-w-5xl mx-auto pb-52 md:pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/owner/listings" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-500 shadow-sm border border-neutral-200 hover:text-primary-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">List Your Property</h1>
            <p className="text-neutral-500 text-sm">
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
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {renderStepIndicator()}

      {/* Form Area */}
      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      {/* Sticky Bottom Navigation Buttons */}
      {/* On mobile this floats ABOVE the app's bottom tab bar (72px + safe area).
          It used to be pinned to bottom-0 at z-50, so the tab bar (z-100) covered
          it completely and owners could not reach Previous/Continue at all. */}
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 md:relative md:bottom-auto bg-white md:bg-transparent border-t border-neutral-200 md:border-t-0 p-4 md:p-0 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] md:shadow-none flex items-center justify-between gap-3 md:pt-6">
        <button 
          type="button" 
          onClick={handlePrev}
          className={`px-6 md:px-8 py-3.5 rounded-xl font-bold border transition-all shadow-sm ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 hover:shadow-md'}`}
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            Save & Continue
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-neutral-900/30 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={20} className="animate-spin" /> Publishing...</> : "Submit & Publish"}
          </button>
        )}
      </div>

    </div>
  );
}
