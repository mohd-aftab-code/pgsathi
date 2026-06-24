"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, CheckCircle2, Upload, Plus } from "lucide-react";
import Link from "next/link";
import LocationPicker from "@/components/common/LocationPicker";

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
  pgType: "SINGLE_ROOM",
  genderAllowed: "BOYS",
  
  // Step 2: Location
  cityId: "",
  localityId: "",
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
  priceMin: "",
  priceMax: "",
  securityDeposit: "",
  photos: [] as { url: string; publicId: string }[],
  
  // Internal: track auto-filled address from map
  _autoAddress: "",
};

type FormData = typeof DEFAULT_FORM;

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Load saved draft from localStorage on first render
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed.currentStep as StepType) || 1;
      }
    } catch {}
    return 1;
  });

  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window === "undefined") return DEFAULT_FORM;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_FORM, ...parsed.formData } as FormData;
      }
    } catch {}
    return DEFAULT_FORM;
  });

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ currentStep, formData }));
    } catch {}
  }, [currentStep, formData]);

  useEffect(() => {
    fetch("/api/cities?localities=true")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCities(data.data);
      });
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setFormData({ ...formData, cityId, localityId: "" });
    const selectedCity = cities.find(c => c.id.toString() === cityId);
    setLocalities(selectedCity?.localities || []);
  };

  const handleNext = () => {
    setError(""); // Clear any previous errors
    
    // Step 2 Validation: Ensure location is selected
    if (currentStep === 2) {
      if (!formData.latitude || !formData.longitude) {
        setError("Please mark the exact location on the map before proceeding.");
        return;
      }
    }

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
    setLoading(true);
    setError("");

    if (!formData.title || !formData.address || !formData.cityId || !formData.priceMin || !formData.priceMax) {
      setError("Please fill all required fields (Name, Address, City, Price).");
      setLoading(false);
      return;
    }

    if (formData.photos.length === 0) {
      setError("Please upload at least one photo for your listing.");
      setLoading(false);
      return;
    }

    try {
      // Create a clean payload mapping to our backend schema
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
        latitude: formData.latitude,
        longitude: formData.longitude,
        priceMin: parseInt(formData.priceMin) || 0,
        priceMax: parseInt(formData.priceMax) || 0,
        securityDeposit: formData.securityDeposit ? parseInt(formData.securityDeposit) : null,
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
    <div className="flex w-full mb-8 rounded-xl overflow-hidden shadow-sm border border-neutral-200">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div 
            key={step.id} 
            className={`flex-1 flex items-center justify-between px-4 py-3 border-r border-white/20 last:border-r-0 transition-colors
              ${isActive ? 'bg-primary-500 text-white font-bold' : 
                isCompleted ? 'bg-primary-100 text-primary-800 font-medium' : 
                'bg-white text-neutral-400 font-medium'}`}
          >
            <span className="text-xs uppercase tracking-wider hidden md:block">Step {step.id}</span>
            <span className="text-sm truncate mx-2">{step.title}</span>
            {isCompleted && <CheckCircle2 size={16} />}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Provide Details of PG</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">PG / Flat Name *</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Enter PG Name"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Description *</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Short catchy description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Place is available for *</label>
            <div className="flex items-center gap-6">
              {['BOYS', 'GIRLS', 'COED'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500 border-neutral-300"
                    checked={formData.genderAllowed === type}
                    onChange={() => setFormData({...formData, genderAllowed: type})}
                  />
                  <span className="text-sm">{type === 'COED' ? 'Co-living' : type === 'BOYS' ? 'Boys' : 'Girls'}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">PG Type *</label>
            <select 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.pgType}
              onChange={e => setFormData({...formData, pgType: e.target.value})}
            >
              <option value="SINGLE_ROOM">Single Room</option>
              <option value="DOUBLE_SHARING">Double Sharing</option>
              <option value="TRIPLE_SHARING">Triple Sharing</option>
              <option value="ENTIRE_FLAT">Entire Flat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Location Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">City *</label>
            <select 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.cityId}
              onChange={handleCityChange}
            >
              <option value="">Select City</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Locality *</label>
            <select 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.localityId}
              onChange={e => setFormData({...formData, localityId: e.target.value})}
              disabled={!formData.cityId}
            >
              <option value="">Select Locality</option>
              {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Complete Address *
              <span className="ml-2 text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                Auto-fills when you select on map
              </span>
            </label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Will auto-fill when you click/search on map below, or type manually..."
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Landmark / Street</label>
              <input 
                type="text" 
                className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Near Apollo Hospital"
                value={formData.landmark}
                onChange={e => setFormData({...formData, landmark: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Pincode *</label>
              <input 
                type="text" 
                className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="110001"
                value={formData.pincode}
                onChange={e => setFormData({...formData, pincode: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary-500" size={20} />
              <h4 className="font-bold text-neutral-800">Mark Locality on Map *</h4>
            </div>
            {(formData.latitude && formData.longitude) && (
              <div className="flex gap-4">
                <input type="text" readOnly value={formData.latitude.toFixed(6)} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg border border-neutral-200 outline-none w-24" placeholder="Latitude" />
                <input type="text" readOnly value={formData.longitude.toFixed(6)} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg border border-neutral-200 outline-none w-24" placeholder="Longitude" />
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-500 mb-4">Click anywhere on the map or drag the marker to pin your property's exact location.</p>
          
          <LocationPicker 
            latitude={formData.latitude} 
            longitude={formData.longitude} 
            onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
            onAddressFound={(address) => setFormData(prev => ({
              ...prev,
              // Only auto-fill if user hasn't typed their own address yet
              address: !prev.address || prev.address === prev._autoAddress ? address : prev.address,
              _autoAddress: address,
            }))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Provide Details of PG</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Available From *</label>
            <input 
              type="date" 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.availableFrom}
              onChange={e => setFormData({...formData, availableFrom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Notice Period</label>
            <div className="flex items-center gap-6">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="noticePeriod" 
                    className="w-4 h-4 text-primary-500"
                    checked={formData.noticePeriod === opt}
                    onChange={() => setFormData({...formData, noticePeriod: opt})}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Food Included</label>
            <div className="flex items-center gap-6">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="foodIncluded" 
                    className="w-4 h-4 text-primary-500"
                    checked={formData.foodIncluded === opt}
                    onChange={() => setFormData({...formData, foodIncluded: opt})}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Gate Closing Time</label>
            <div className="flex items-center gap-6">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gateClosingTime" 
                    className="w-4 h-4 text-primary-500"
                    checked={formData.gateClosingTime === opt}
                    onChange={() => setFormData({...formData, gateClosingTime: opt})}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">PG Rules</label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-500 rounded border-neutral-300"
                  checked={formData.rentLockIn}
                  onChange={(e) => setFormData({...formData, rentLockIn: e.target.checked})}
                />
                <span className="text-sm font-medium">Rent lock-in</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-500 rounded border-neutral-300"
                  checked={formData.noGuardiansStay}
                  onChange={(e) => setFormData({...formData, noGuardiansStay: e.target.checked})}
                />
                <span className="text-sm font-medium">No guardians stay</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Laundry Service</label>
            <div className="flex items-center gap-6">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="laundry" className="w-4 h-4 text-primary-500" checked={formData.laundryService === opt} onChange={() => setFormData({...formData, laundryService: opt})} />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Room Cleaning</label>
            <div className="flex items-center gap-6">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cleaning" className="w-4 h-4 text-primary-500" checked={formData.roomCleaning === opt} onChange={() => setFormData({...formData, roomCleaning: opt})} />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Available Amenities of PG</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {AMENITIES_LIST.map(amenity => (
            <label key={amenity.id} className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-primary-500 rounded border-neutral-300"
                checked={formData.selectedAmenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id, 'pg')}
              />
              <span className="text-sm font-medium text-neutral-700">{amenity.label}</span>
            </label>
          ))}
        </div>

        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Room Amenities of PG</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {ROOM_AMENITIES_LIST.map(amenity => (
            <label key={amenity.id} className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-primary-500 rounded border-neutral-300"
                checked={formData.selectedRoomAmenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id, 'room')}
              />
              <span className="text-sm font-medium text-neutral-700">{amenity.label}</span>
            </label>
          ))}
        </div>

        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Parking</h3>
        <div className="flex items-center gap-6">
          {['Yes', 'No'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="parking" className="w-4 h-4 text-primary-500" checked={formData.parking === opt} onChange={() => setFormData({...formData, parking: opt})} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Gallery */}
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Gallery</h3>
        
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {formData.photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group shadow-sm">
                <img src={photo.url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 bg-red-500/90 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-primary-200 bg-primary-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-100 transition-colors relative">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
            disabled={uploadingImage}
          />
          {uploadingImage ? (
             <Loader2 className="text-primary-500 mb-4 animate-spin" size={32} />
          ) : (
             <Upload className="text-primary-500 mb-4" size={32} />
          )}
          <p className="font-bold text-neutral-800 mb-1">{uploadingImage ? "Uploading..." : "Click to Upload Photos"}</p>
          <p className="text-xs text-neutral-500 mb-6">Upload multiple high-quality images of your property</p>
          <div className="bg-white text-primary-600 font-bold px-6 py-2 rounded-full shadow-sm text-sm border border-primary-100">Browse Files</div>
          <p className="text-[10px] text-neutral-400 mt-4">Max size 5MB per image</p>
        </label>
      </div>

      {/* Pricing */}
      <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Pricing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Min Rent (₹/mo) *</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.priceMin} onChange={e => setFormData({...formData, priceMin: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Max Rent (₹/mo) *</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.priceMax} onChange={e => setFormData({...formData, priceMax: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Security Deposit (₹)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <button 
          type="button" 
          onClick={handlePrev}
          className={`px-8 py-3 rounded-xl font-bold border transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary-500/30"
          >
            Save & Continue
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary-500/30 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={20} className="animate-spin" /> Publishing...</> : "Submit & Publish"}
          </button>
        )}
      </div>

    </div>
  );
}
