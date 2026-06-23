"use client";

import { useState } from "react";
import { MessageSquare, Phone } from "lucide-react";

interface Props {
  listingId: number;
  ownerPhone: string;
  listingTitle: string;
}

export default function ContactOwnerButton({ listingId, ownerPhone, listingTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const handleWhatsAppClick = async () => {
    setLoading(true);
    try {
      // Register lead in background
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          source: "WHATSAPP",
          message: "Clicked WhatsApp button"
        })
      });
      
      // Open WhatsApp
      const waUrl = `https://wa.me/91${ownerPhone}?text=Hi, I am interested in your PG: ${listingTitle}`;
      window.open(waUrl, "_blank");
    } catch (error) {
      console.error("Failed to log lead", error);
      // Open anyway even if logging fails
      const waUrl = `https://wa.me/91${ownerPhone}?text=Hi, I am interested in your PG: ${listingTitle}`;
      window.open(waUrl, "_blank");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneClick = async () => {
    if (showPhone) {
      window.location.href = `tel:+91${ownerPhone}`;
      return;
    }
    
    setLoading(true);
    try {
      // Register lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          source: "PHONE",
          message: "Revealed Phone Number"
        })
      });
      setShowPhone(true);
    } catch (error) {
      console.error("Failed to log lead", error);
      setShowPhone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={handleWhatsAppClick}
        disabled={loading}
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        <MessageSquare size={20} /> {loading ? "Connecting..." : "WhatsApp Owner"}
      </button>
      
      <button 
        onClick={handlePhoneClick}
        disabled={loading}
        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        <Phone size={20} /> {showPhone ? `+91 ${ownerPhone}` : "Show Phone Number"}
      </button>
    </div>
  );
}
