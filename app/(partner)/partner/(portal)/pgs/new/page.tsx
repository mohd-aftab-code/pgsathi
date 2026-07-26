"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, Upload, User } from "lucide-react";
import { LocationStep, validateLocation } from "@/components/listings/LocationStep";

/**
 * Partner PG registration — the SAME multi-step wizard the owner uses, with an
 * added "Owner details" section at step 1 (the partner registers on the owner's
 * behalf). Submits the full payload to /api/partner/pgs, which creates the owner
 * account + listing with partnerId stamped.
 *
 * The owner's own form is left untouched; this reuses the shared LocationStep and
 * mirrors the same step design.
 */

type StepType = 1 | 2 | 3 | 4 | 5;
const STEPS = [
  { id: 1, title: "Owner & Room" },
  { id: 2, title: "Location" },
  { id: 3, title: "PG Details" },
  { id: 4, title: "Amenities" },
  { id: 5, title: "Photos & Price" },
];

const AMENITIES_LIST = [
  { id: "power_backup", label: "Power Back Up" }, { id: "lift", label: "Lift" },
  { id: "wifi", label: "Wi-Fi" }, { id: "water_cooler", label: "Water Cooler" },
  { id: "fridge", label: "Fridge" }, { id: "microwave", label: "Microwave" },
  { id: "first_aid", label: "First Aid Kit" }, { id: "warden", label: "Warden / Manager" },
  { id: "security", label: "Security Guard" }, { id: "gym", label: "Gym" },
];
const ROOM_AMENITIES_LIST = [
  { id: "tv", label: "Television" }, { id: "bed", label: "Single Bed" },
  { id: "ac", label: "AC / Heating" }, { id: "mattress", label: "Mattress + Pillow" },
  { id: "table", label: "Table + Chair" }, { id: "blanket", label: "Blanket / Quilt" },
  { id: "cupboard", label: "Cupboard" },
];
const ROOM_TYPES = [
  { id: "SINGLE_ROOM", label: "Single Room" }, { id: "DOUBLE_SHARING", label: "Double Sharing" },
  { id: "TRIPLE_SHARING", label: "Triple Sharing" }, { id: "ENTIRE_FLAT", label: "Entire Flat" },
  { id: "DORMITORY", label: "Dormitory" }, { id: "STUDIO", label: "Studio" },
];
const ROOM_LABEL: Record<string, string> = Object.fromEntries(ROOM_TYPES.map((r) => [r.id, r.label]));

const DEFAULT_FORM = {
  ownerName: "", ownerPhone: "", ownerEmail: "",
  title: "", description: "", roomTypes: ["SINGLE_ROOM"] as string[], genderAllowed: "BOYS",
  cityName: "", stateName: "", localityId: "", areaLocality: "", address: "", pincode: "",
  landmark: "", latitude: null as number | null, longitude: null as number | null,
  noticePeriod: "No", foodIncluded: "No", gateClosingTime: "No", rentLockIn: true, noGuardiansStay: true,
  laundryService: "No", roomCleaning: "No", parking: "No",
  selectedAmenities: [] as string[], selectedRoomAmenities: [] as string[],
  roomPrices: {} as Record<string, { rent: string; deposit: string }>,
  electricityCharge: "", maintenanceCharge: "", foodCharge: "", setupFee: "",
  photos: [] as { url: string; publicId: string }[],
};
type FormData = typeof DEFAULT_FORM;

export default function PartnerNewPgPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepType>(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);

  // Arriving from "Inka PG list karein" on the Owners page — pre-fill the owner
  // so the partner isn't retyping details of someone they just registered.
  const ownerParam = useSearchParams()?.get("owner");
  const [prefilled, setPrefilled] = useState<string | null>(null);
  useEffect(() => {
    if (!ownerParam) return;
    let alive = true;
    fetch("/api/partner/owners")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.success) return;
        const o = (d.data as any[]).find((x) => String(x.id) === ownerParam);
        if (!o) return;
        setForm((f) => ({ ...f, ownerName: o.name, ownerPhone: o.phone ?? "", ownerEmail: o.email ?? "" }));
        setPrefilled(o.name);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [ownerParam]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ createdOwner: boolean; ownerLogin?: { name: string; phone: string; password: string } | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  function toggleAmenity(id: string, kind: "pg" | "room") {
    const key = kind === "pg" ? "selectedAmenities" : "selectedRoomAmenities";
    setForm((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((a) => a !== id) : [...f[key], id] }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true); setError("");
    try {
      const uploaded: { url: string; publicId: string }[] = [];
      for (const file of Array.from(e.target.files)) {
        const fd = new FormData(); fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (d.success) uploaded.push({ url: d.url, publicId: d.publicId });
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...uploaded] }));
    } catch { setError("Photo upload nahi hua. Dobara try karein."); } finally { setUploading(false); }
  }

  function validateStep(s: StepType): string | null {
    if (s === 1) {
      if (form.ownerName.trim().length < 2) return "Owner ka naam daalein.";
      if (form.ownerPhone.length !== 10) return "Owner ka 10-digit phone daalein.";
      if (!form.title.trim()) return "PG ka naam daalein.";
      if (!form.description.trim()) return "Chhota description daalein.";
      if (form.roomTypes.length === 0) return "Kam se kam ek room type chunein.";
    }
    if (s === 2) return validateLocation(form as any);
    if (s === 5) {
      if (form.photos.length === 0) return "Kam se kam ek photo upload karein.";
      for (const rt of form.roomTypes) if (!form.roomPrices[rt]?.rent) return "Har room type ka rent daalein.";
    }
    return null;
  }

  function next() {
    const p = validateStep(step);
    if (p) { setError(p); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setError("");
    if (step < 5) setStep((s) => (s + 1) as StepType);
  }
  function prev() { if (step > 1) setStep((s) => (s - 1) as StepType); }

  async function submit() {
    setError("");
    for (const s of [1, 2, 5] as StepType[]) {
      const p = validateStep(s);
      if (p) { setError(`Step ${s}: ${p}`); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }
    setLoading(true);
    let minRent = Infinity, maxRent = 0;
    for (const rt of form.roomTypes) {
      const r = parseInt(form.roomPrices[rt]?.rent || "0") || 0;
      if (r < minRent) minRent = r; if (r > maxRent) maxRent = r;
    }
    try {
      const res = await fetch("/api/partner/pgs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: form.ownerName, ownerPhone: form.ownerPhone, ownerEmail: form.ownerEmail,
          title: form.title, description: form.description, roomTypes: form.roomTypes, genderAllowed: form.genderAllowed,
          cityName: form.cityName.trim(), stateName: form.stateName.trim(),
          localityId: form.localityId ? parseInt(form.localityId) : null, areaLocality: form.areaLocality.trim() || null,
          address: form.address, pincode: form.pincode, landmark: form.landmark,
          latitude: form.latitude, longitude: form.longitude,
          rent: minRent === Infinity ? 0 : minRent, rentMax: maxRent,
          roomPrices: form.roomPrices,
          electricityCharge: form.electricityCharge ? parseInt(form.electricityCharge) : null,
          maintenanceCharge: form.maintenanceCharge ? parseInt(form.maintenanceCharge) : null,
          foodCharge: form.foodCharge ? parseInt(form.foodCharge) : null,
          setupFee: form.setupFee ? parseInt(form.setupFee) : null,
          foodIncluded: form.foodIncluded === "Yes", noticePeriod: form.noticePeriod === "Yes",
          gateClosingTime: form.gateClosingTime === "Yes", rentLockIn: form.rentLockIn, noGuardiansStay: form.noGuardiansStay,
          laundryService: form.laundryService === "Yes", roomCleaning: form.roomCleaning === "Yes", parking: form.parking === "Yes",
          photos: form.photos, amenities: [...form.selectedAmenities, ...form.selectedRoomAmenities],
        }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message || "PG register nahi ho paya"); setLoading(false); return; }
      setDone({ createdOwner: d.data?.createdOwner, ownerLogin: d.data?.ownerLogin ?? null });
    } catch { setError("Kuch gadbad ho gayi. Dobara try karein."); setLoading(false); }
  }

  // ── shared styling (matches owner form, dark-aware) ──
  const card = "border border-neutral-100 dark:border-neutral-800 shadow-sm rounded-3xl p-5 md:p-8 bg-white dark:bg-neutral-900";
  const inp = "w-full h-14 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm";
  const lbl = "block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2";
  const yesNo = (field: keyof FormData, label: string) => (
    <div>
      <label className={lbl}>{label}</label>
      <div className="grid grid-cols-2 gap-3">
        {["Yes", "No"].map((opt) => (
          <button type="button" key={opt} onClick={() => set({ [field]: opt } as any)}
            className={`h-11 rounded-2xl border-2 text-sm font-bold transition-colors ${form[field] === opt ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300" : "border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 grid place-items-center mx-auto mb-5">
          <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">PG register ho gaya 🎉</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Admin approval ke baad live hoga.{done.createdOwner && " Owner ka account bhi ban gaya."}</p>

        {/* Shown once, right here. The password is hashed in the database and can
            never be read back — without handing it over now, the owner cannot log
            in, cannot see their PG, and cannot buy a plan. */}
        {done.ownerLogin && (
          <div className="max-w-md mx-auto mb-6 rounded-2xl border-2 border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/40 p-5 text-left">
            <p className="font-bold text-primary-900 dark:text-primary-200 mb-1">
              {done.ownerLogin.name} ko ye login de dijiye
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-400 mb-4">
              Ye password <b>sirf abhi</b> dikhega. Iske bina owner login nahi kar payega —
              na apna PG dekh payega, na plan le payega.
            </p>

            {[
              { k: "Phone (login ID)", v: done.ownerLogin.phone },
              { k: "Password", v: done.ownerLogin.password },
            ].map((row) => (
              <div key={row.k} className="rounded-xl bg-white dark:bg-neutral-900 border border-primary-100 dark:border-neutral-700 px-4 py-2.5 mb-2">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{row.k}</div>
                <div className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white">{row.v}</div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const l = done.ownerLogin!;
                navigator.clipboard
                  ?.writeText(
                    `PGSathi login\nPhone: ${l.phone}\nPassword: ${l.password}\n${window.location.origin}/login`,
                  )
                  .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
              }}
              className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors"
            >
              {copied ? "Copy ho gaya ✓" : "Login details copy karein"}
            </button>
            <p className="text-[11px] text-primary-700/80 dark:text-primary-400/70 mt-2">
              Bhool jaayein to <b>Owners</b> page se naya password bana sakte hain.
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Link href="/partner/pgs" className="h-11 px-5 leading-[2.75rem] rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm">My PGs dekhein</Link>
          <button onClick={() => { setDone(null); setForm(DEFAULT_FORM); setStep(1); }} className="h-11 px-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm">Ek aur add karein</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-40">
      <Link href="/partner/pgs" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-5">
        <ArrowLeft size={16} /> My PGs
      </Link>
      <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-6">PG Register karein</h1>

      {/* Step indicator */}
      <div className="flex w-full mb-8 overflow-x-auto pb-2">
        <div className="flex w-full min-w-[560px] justify-between relative px-2">
          <div className="absolute top-4 left-4 right-4 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
          <div className="absolute top-4 left-4 h-1 bg-primary-500 rounded-full transition-all duration-500" style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 1rem)` }} />
          {STEPS.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-xs transition-all ${step === s.id ? "bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-950" : step > s.id ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400" : "bg-white dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700"}`}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={`text-[11px] font-bold whitespace-nowrap ${step === s.id ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>}

      {/* ── Step 1: Owner + Basic ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className={card}>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <User size={18} className="text-primary-500" /> Owner ki details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {prefilled && (
                <div className="sm:col-span-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 px-3 py-2 text-xs text-primary-800 dark:text-primary-300">
                  <b>{prefilled}</b> ke liye PG list ho raha hai — inka account pehle se bana hua hai.
                </div>
              )}
              <div><label className={lbl}>Owner ka naam *</label><input className={inp} value={form.ownerName} onChange={(e) => set({ ownerName: e.target.value })} placeholder="e.g. Suresh Gupta" /></div>
              <div><label className={lbl}>Owner ka phone *</label><input className={inp} type="tel" inputMode="numeric" maxLength={10} value={form.ownerPhone} onChange={(e) => set({ ownerPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit number" /></div>
              <div className="md:col-span-2"><label className={lbl}>Owner ka email (optional)</label><input className={inp} type="email" value={form.ownerEmail} onChange={(e) => set({ ownerEmail: e.target.value })} placeholder="owner@example.com" /></div>
            </div>
          </div>

          <div className={card}>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">PG ki jaankari</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={lbl}>PG / Flat Name *</label><input className={inp} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Enter PG Name" /></div>
              <div><label className={lbl}>Description *</label><input className={inp} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Short catchy description" /></div>
              <div className="md:col-span-2">
                <label className={lbl}>Place is available for *</label>
                <div className="grid grid-cols-3 gap-3">
                  {["BOYS", "GIRLS", "COED"].map((t) => (
                    <button type="button" key={t} onClick={() => set({ genderAllowed: t })}
                      className={`h-14 rounded-2xl border-2 text-sm font-bold transition-colors ${form.genderAllowed === t ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300" : "border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"}`}>
                      {t === "COED" ? "Co-living" : t === "BOYS" ? "Boys" : "Girls"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Room Types Available *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROOM_TYPES.map((t) => {
                    const on = form.roomTypes.includes(t.id);
                    return (
                      <button type="button" key={t.id}
                        onClick={() => set({ roomTypes: on ? (form.roomTypes.length > 1 ? form.roomTypes.filter((x) => x !== t.id) : form.roomTypes) : [...form.roomTypes, t.id] })}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-left transition-colors ${on ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40" : "border-neutral-100 dark:border-neutral-700"}`}>
                        <span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${on ? "bg-primary-500" : "border-2 border-neutral-300 dark:border-neutral-600"}`}>{on && <CheckCircle2 size={14} className="text-white" />}</span>
                        <span className={`text-sm font-bold ${on ? "text-primary-800 dark:text-primary-300" : "text-neutral-600 dark:text-neutral-300"}`}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Location (shared component) ── */}
      {step === 2 && (
        <LocationStep
          value={{ stateName: form.stateName, cityName: form.cityName, pincode: form.pincode, areaLocality: form.areaLocality, localityId: form.localityId, address: form.address, landmark: form.landmark, latitude: form.latitude, longitude: form.longitude }}
          onChange={(patch) => set(patch as any)}
        />
      )}

      {/* ── Step 3: PG Details ── */}
      {step === 3 && (
        <div className={card}>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-800">PG Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {yesNo("noticePeriod", "Notice Period")}
            {yesNo("foodIncluded", "Food Included")}
            {yesNo("gateClosingTime", "Gate Closing Time")}
          </div>
          <label className={lbl}>PG Rules</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([["rentLockIn", "Rent lock-in"], ["noGuardiansStay", "No guardians stay"]] as const).map(([f, l]) => (
              <button type="button" key={f} onClick={() => set({ [f]: !form[f] } as any)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${form[f] ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40" : "border-neutral-100 dark:border-neutral-700"}`}>
                <span className={`w-6 h-6 rounded grid place-items-center shrink-0 ${form[f] ? "bg-primary-500" : "border-2 border-neutral-300 dark:border-neutral-600"}`}>{form[f] && <CheckCircle2 size={15} className="text-white" />}</span>
                <span className={`text-sm font-bold ${form[f] ? "text-primary-800 dark:text-primary-300" : "text-neutral-600 dark:text-neutral-300"}`}>{l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 4: Amenities ── */}
      {step === 4 && (
        <div className={card}>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {yesNo("laundryService", "Laundry Service")}
            {yesNo("roomCleaning", "Room Cleaning")}
            {yesNo("parking", "Parking")}
          </div>
          <h3 className="text-sm font-black text-neutral-900 dark:text-white mt-6 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800 uppercase tracking-wider">PG Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {AMENITIES_LIST.map((a) => {
              const on = form.selectedAmenities.includes(a.id);
              return (
                <button type="button" key={a.id} onClick={() => toggleAmenity(a.id, "pg")}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-colors ${on ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40" : "border-neutral-100 dark:border-neutral-700"}`}>
                  {on && <CheckCircle2 size={14} className="absolute top-2 right-2 text-primary-500" />}
                  <span className={`text-sm font-bold ${on ? "text-primary-800 dark:text-primary-300" : "text-neutral-600 dark:text-neutral-300"}`}>{a.label}</span>
                </button>
              );
            })}
          </div>
          <h3 className="text-sm font-black text-neutral-900 dark:text-white mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800 uppercase tracking-wider">Room Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ROOM_AMENITIES_LIST.map((a) => {
              const on = form.selectedRoomAmenities.includes(a.id);
              return (
                <button type="button" key={a.id} onClick={() => toggleAmenity(a.id, "room")}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-colors ${on ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40" : "border-neutral-100 dark:border-neutral-700"}`}>
                  {on && <CheckCircle2 size={14} className="absolute top-2 right-2 text-primary-500" />}
                  <span className={`text-sm font-bold ${on ? "text-primary-800 dark:text-primary-300" : "text-neutral-600 dark:text-neutral-300"}`}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 5: Photos + Pricing ── */}
      {step === 5 && (
        <div className="space-y-6">
          <div className={card}>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">Photos *</h3>
            {form.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-neutral-100 dark:border-neutral-700 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, x) => x !== i) }))}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                  </div>
                ))}
              </div>
            )}
            <label className="border-2 border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-full grid place-items-center shadow-sm mb-3 text-primary-500">
                {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
              </div>
              <p className="font-bold text-neutral-900 dark:text-white">{uploading ? "Uploading…" : "Photos upload karein"}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Multiple high-quality images</p>
            </label>
          </div>

          <div className={card}>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-1">Pricing per Room Type</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">Har room type ka rent aur deposit set karein.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {form.roomTypes.map((rt) => (
                <div key={rt} className="border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/30 dark:bg-neutral-800/40">
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-500" /> {ROOM_LABEL[rt] || rt}</h4>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Rent (₹/mo) *</label>
                  <input type="number" className="w-full h-11 px-3 mb-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="8000"
                    value={form.roomPrices[rt]?.rent || ""} onChange={(e) => set({ roomPrices: { ...form.roomPrices, [rt]: { rent: e.target.value, deposit: form.roomPrices[rt]?.deposit || "" } } })} />
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1">Deposit (₹)</label>
                  <input type="number" className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="10000"
                    value={form.roomPrices[rt]?.deposit || ""} onChange={(e) => set({ roomPrices: { ...form.roomPrices, [rt]: { rent: form.roomPrices[rt]?.rent || "", deposit: e.target.value } } })} />
                </div>
              ))}
            </div>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-4 uppercase tracking-wider">Additional Charges (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([["maintenanceCharge", "Maintenance"], ["electricityCharge", "Electricity"], ["foodCharge", "Food / Mess"], ["setupFee", "Setup Fee"]] as const).map(([f, l]) => (
                <div key={f}><label className={lbl}>{l}</label><input type="number" className={inp} value={form[f]} onChange={(e) => set({ [f]: e.target.value } as any)} /></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav bar — floats above the mobile tab bar */}
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 lg:relative lg:bottom-auto bg-white dark:bg-neutral-900 lg:bg-transparent border-t border-neutral-200 dark:border-neutral-800 lg:border-t-0 p-4 lg:p-0 z-40 flex items-center justify-between gap-3 lg:mt-6">
        <button type="button" onClick={prev} className={`px-6 py-3 rounded-xl font-bold border-2 text-sm transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"}`}>Previous</button>
        {step < 5 ? (
          <button type="button" onClick={next} className="px-8 py-3 rounded-xl font-bold bg-primary-500 hover:bg-primary-600 text-white text-sm shadow-lg shadow-primary-500/25">Save &amp; Continue</button>
        ) : (
          <button type="button" onClick={submit} disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-neutral-900 dark:bg-primary-500 text-white text-sm flex items-center gap-2 disabled:opacity-70">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : "Submit PG"}
          </button>
        )}
      </div>
    </div>
  );
}
