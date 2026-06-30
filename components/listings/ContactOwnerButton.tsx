"use client";

import { useState } from "react";
import { MessageSquare, Phone, X, CheckCircle } from "lucide-react";

interface Props {
  listingId: number;
  ownerPhone: string;
  listingTitle: string;
  hasActiveSubscription?: boolean;
}

export default function ContactOwnerButton({ listingId, ownerPhone, listingTitle, hasActiveSubscription = true }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [leadAction, setLeadAction] = useState<"PHONE" | "WHATSAPP">("PHONE");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActionClick = (action: "PHONE" | "WHATSAPP") => {
    // If the phone is already revealed and they clicked phone, just call
    if (action === "PHONE" && showPhone) {
      window.location.href = `tel:+91${ownerPhone}`;
      return;
    }
    setLeadAction(action);
    setShowPopup(true);
    setSuccess(false);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantPhone.trim() || tenantPhone.length < 10) {
      alert("Please enter a valid name and phone number");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          source: leadAction,
          name: tenantName,
          phone: tenantPhone,
          message: `Requested ${leadAction} contact.`
        })
      });

      if (hasActiveSubscription) {
        // Reveal contact directly
        setShowPopup(false);
        if (leadAction === "WHATSAPP") {
          const waUrl = `https://wa.me/91${ownerPhone}?text=Hi, I am interested in your PG: ${listingTitle}`;
          window.open(waUrl, "_blank");
        } else {
          setShowPhone(true);
        }
      } else {
        // Intercept lead (Admin will contact)
        setSuccess(true);
      }
    } catch (error) {
      console.error("Failed to log lead", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <button 
          onClick={() => handleActionClick("WHATSAPP")}
          disabled={loading && !showPopup}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <MessageSquare size={20} /> {loading && leadAction === "WHATSAPP" && !showPopup ? "Connecting..." : "WhatsApp Owner"}
        </button>
        
        <button 
          onClick={() => handleActionClick("PHONE")}
          disabled={loading && !showPopup}
          className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Phone size={20} /> {showPhone ? `+91 ${ownerPhone}` : "Show Phone Number"}
        </button>
      </div>

      {/* Lead Capture Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Request Received!</h3>
                  <p className="text-neutral-600 mb-6">
                    Thank you! Our executive will connect you with the PG owner shortly.
                  </p>
                  <button 
                    onClick={() => setShowPopup(false)}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Contact Owner</h3>
                  <p className="text-neutral-500 mb-6 text-sm">
                    Please provide your details to connect with the owner of <strong>{listingTitle}</strong>.
                  </p>

                  <form onSubmit={submitLead} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                        className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="9876543210"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold transition-colors mt-2"
                    >
                      {loading ? "Connecting..." : "Get Contact Details"}
                    </button>
                    <p className="text-xs text-center text-neutral-400 mt-3">
                      By continuing, you agree to our Terms & Conditions.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
