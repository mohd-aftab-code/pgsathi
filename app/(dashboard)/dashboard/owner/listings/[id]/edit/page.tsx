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
  priceMin: "",
  priceMax: "",
  securityDeposit: "",
  electricityCharge: "",
  maintenanceCharge: "",
  foodCharge: "",
  setupFee: "",
  photos: [] as { url: string; publicId: string }[],
  
  // Internal: track auto-filled address from map
  _autoAddress: "",
};

type FormData = typeof DEFAULT_FORM;

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const [listingId, setListingId] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    params.then(p => setListingId(p.id));
  }, [params]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  // Load saved draft from localStorage on first render
  const [currentStep, setCurrentStep] = useState<StepType>(1);

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  

  
  useEffect(() => {
    if (!listingId) return;
    fetch(`/api/listings/${listingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const l = data.data;
          
          // Split amenities into PG and Room
          const pgAmenities: string[] = [];
          const roomAmenities: string[] = [];
          
          if (l.amenities) {
            l.amenities.forEach((a: any) => {
              const slug = a.amenity?.slug;
              if (AMENITIES_LIST.find(x => x.id === slug)) pgAmenities.push(slug);
              else if (ROOM_AMENITIES_LIST.find(x => x.id === slug)) roomAmenities.push(slug);
            });
          }

          setFormData({
            title: l.title || "",
            description: l.description || "",
            roomTypes: l.roomTypes?.length > 0 ? l.roomTypes : ["SINGLE_ROOM"],
            genderAllowed: l.genderAllowed || "BOYS",
            localityId: l.localityId?.toString() || "",
            cityName: l.city?.name || "",
            stateName: l.city?.state || "",
            areaLocality: l.areaLocality || l.locality?.name || "",
            address: l.address || "",
            pincode: l.pincode || "",
            landmark: l.landmark || "",
            latitude: l.latitude || null,
            longitude: l.longitude || null,
            noticePeriod: l.noticePeriod ? "Yes" : "No",
            foodIncluded: l.foodIncluded ? "Yes" : "No",
            gateClosingTime: l.gateClosingTime ? "Yes" : "No",
            preferredGuest: l.preferredGuest || "Both",
            rentLockIn: l.rentLockIn || false,
            noGuardiansStay: l.noGuardiansStay || false,
            laundryService: l.laundryService ? "Yes" : "No",
            roomCleaning: l.roomCleaning ? "Yes" : "No",
            parking: l.parking ? "Yes" : "No",
            selectedAmenities: pgAmenities,
            selectedRoomAmenities: roomAmenities,
            priceMin: l.priceMin?.toString() || "",
            priceMax: l.priceMax?.toString() || "",
            securityDeposit: l.securityDeposit?.toString() || "",
            electricityCharge: l.electricityCharge?.toString() || "",
            maintenanceCharge: l.maintenanceCharge?.toString() || "",
            foodCharge: l.foodCharge?.toString() || "",
            setupFee: l.setupFee?.toString() || "",
            photos: l.photos ? l.photos.map((p: any) => ({ url: p.url, publicId: p.publicId })) : [],
            _autoAddress: l.address || "",
          });
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [listingId]);

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

  const validateStep = (step: StepType): string | null => {
    if (step === 1) {
      if (!formData.title.trim()) return "PG / Flat ka naam daalein.";
      if (formData.roomTypes.length === 0) return "Kam se kam ek room type chunein.";
    }
    // Shared with the new-listing page so both reject the same things
    if (step === 2) return validateLocation(formData);
    if (step === 5) {
      if (formData.photos.length === 0) return "Please upload at least one photo.";
      if (!formData.priceMin || !formData.priceMax) return "Price range daalein.";
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

    // Send the owner back to the step that's incomplete instead of showing an
    // error about a step they can't see.
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

    try {
      // Create a clean payload mapping to our backend schema
      const payload = {
        title: formData.title,
        description: formData.description,
        roomTypes: formData.roomTypes,
        genderAllowed: formData.genderAllowed,
        // The server resolves (and if needed creates) the City row from these.
        cityName: formData.cityName.trim(),
        stateName: formData.stateName.trim(),
        localityId: formData.localityId ? parseInt(formData.localityId) : null,
        areaLocality: formData.areaLocality.trim() || null,
        address: formData.address,
        pincode: formData.pincode,
        landmark: formData.landmark,
        latitude: formData.latitude,
        longitude: formData.longitude,
        priceMin: parseInt(formData.priceMin) || 0,
        priceMax: parseInt(formData.priceMax) || 0,
        securityDeposit: formData.securityDeposit ? parseInt(formData.securityDeposit) : null,
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

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        // Clear saved draft on success
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
    <div className="flex w-full mb-8 rounded-xl overflow-x-auto whitespace-nowrap shadow-sm border border-neutral-200/60 snap-x hide-scrollbar">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div 
            key={step.id} 
            className={`flex-1 flex items-center justify-between px-4 py-3 min-w-[180px] md:min-w-0 border-r border-white/20 last:border-r-0 transition-colors snap-start
              ${isActive ? 'bg-primary-500 text-white font-bold' : 
                isCompleted ? 'bg-primary-100 text-primary-800 font-medium' : 
                'bg-white/60 backdrop-blur-md text-neutral-400 font-medium'}`}
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
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Provide Details of PG</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">PG / Flat Name *</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Enter PG Name"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Description *</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none"
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
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Room Types Available *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "SINGLE_ROOM", label: "Single Room" },
                { id: "DOUBLE_SHARING", label: "Double Sharing" },
                { id: "TRIPLE_SHARING", label: "Triple Sharing" },
                { id: "ENTIRE_FLAT", label: "Entire Flat" },
                { id: "DORMITORY", label: "Dormitory" },
                { id: "STUDIO", label: "Studio" },
              ].map((type) => (
                <label key={type.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.roomTypes.includes(type.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200/60 hover:bg-neutral-50'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
                    checked={formData.roomTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, roomTypes: [...formData.roomTypes, type.id] });
                      } else {
                        // Ensure at least one is selected
                        if (formData.roomTypes.length > 1) {
                          setFormData({ ...formData, roomTypes: formData.roomTypes.filter(id => id !== type.id) });
                        }
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{type.label}</span>
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
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Provide Details of PG</h3>
        
        {/* "Available From" removed — see the new-listing form: it had no schema
            column and was never submitted. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
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
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Gallery</h3>
        
        {formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {formData.photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200/60 group shadow-sm">
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
          <div className="bg-white/60 backdrop-blur-md text-primary-600 font-bold px-6 py-2 rounded-full shadow-sm text-sm border border-primary-100">Browse Files</div>
          <p className="text-[10px] text-neutral-400 mt-4">Max size 5MB per image</p>
        </label>
      </div>

      {/* Pricing */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200/60 shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-6 pb-4 border-b">Pricing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Min Rent (₹/mo) *</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.priceMin} onChange={e => setFormData({...formData, priceMin: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Max Rent (₹/mo) *</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.priceMax} onChange={e => setFormData({...formData, priceMax: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Security Deposit (₹)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} />
          </div>
        </div>
        <h3 className="text-md font-bold text-neutral-800 mb-4">Additional Charges (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Maintenance (₹/mo)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.maintenanceCharge} onChange={e => setFormData({...formData, maintenanceCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Electricity (₹/mo)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.electricityCharge} onChange={e => setFormData({...formData, electricityCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Food / Mess (₹/mo)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.foodCharge} onChange={e => setFormData({...formData, foodCharge: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Setup Fee (One-time)</label>
            <input type="number" className="w-full h-12 px-4 rounded-xl border border-neutral-200/60 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.setupFee} onChange={e => setFormData({...formData, setupFee: e.target.value})} />
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
          <Link href="/dashboard/owner/listings" className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-500 shadow-sm border border-neutral-200/60 hover:text-primary-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Edit Your Property</h1>
            <p className="text-neutral-500 text-sm">
              ✅ Make changes to your listing details and submit for update.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Start fresh? All filled data will be cleared.")) {
                            window.location.reload();
            }
          }}
          className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider hover:text-red-500 border border-neutral-200/60 rounded-2xl px-3 py-1.5 transition-colors"
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

      {/* Navigation Buttons — same mobile treatment as the new-listing form:
          floats above the app's bottom tab bar instead of being buried by it. */}
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 md:relative md:bottom-auto bg-white/60 backdrop-blur-md md:bg-transparent border-t border-neutral-200/60 p-4 md:p-0 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] md:shadow-none flex items-center justify-between gap-3 md:pt-6">
        <button
          type="button"
          onClick={handlePrev}
          className={`px-6 md:px-8 py-3 rounded-xl font-bold border transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 md:px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary-500/30"
          >
            Save & Continue
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary-500/30 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={20} className="animate-spin" /> Publishing...</> : "Submit & Publish"}
          </button>
        )}
      </div>

    </div>
  );
}
