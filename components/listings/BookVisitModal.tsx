"use client";

import { useState } from "react";
import { Calendar, Clock, X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function BookVisitModal({ listingId, ownerName }: { listingId: number, ownerName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !phone) return toast.error("All fields are required");

    setLoading(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, name, phone, visitDate: new Date(date).toISOString() })
      });

      if (!res.ok) throw new Error("Failed to book");
      setSuccess(true);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-primary-600/20"
      >
        <Calendar size={20} />
        Schedule a Visit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 text-neutral-600 transition"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black mb-2">Visit Scheduled!</h3>
                <p className="text-neutral-500 mb-8">
                  {ownerName} has received your visit request. You will receive a confirmation shortly.
                </p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl font-bold transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <h3 className="text-2xl font-black mb-2">Schedule a Visit</h3>
                <p className="text-neutral-500 mb-6 text-sm">Select a date and time to visit the property.</p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1">Select Date & Time</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-3 top-3.5 text-neutral-400" />
                      <input 
                        type="datetime-local" 
                        value={date} onChange={e => setDate(e.target.value)}
                        className="w-full border border-neutral-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary-500 outline-none bg-white" 
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl disabled:opacity-70 transition-all shadow-lg shadow-primary-600/20"
                >
                  {loading ? "Confirming..." : "Confirm Visit"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
