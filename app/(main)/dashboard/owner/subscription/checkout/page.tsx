"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PLANS = {
  free: { name: "Starter", price: 0, duration: "30 Days" },
  basic: { name: "Growth", price: 349, duration: "1 Month" },
  pro: { name: "Pro Owner", price: 1799, duration: "1 Month" },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("plan") as keyof typeof PLANS || "basic";
  const selectedPlan = PLANS[planId] || PLANS.basic;

  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStep("PROCESSING");

    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, amount: selectedPlan.price }),
        });

        if (res.ok) {
          setPaymentStep("SUCCESS");
          // Redirect after showing success for 2 seconds
          setTimeout(() => {
            router.push("/dashboard/owner/subscription");
            router.refresh();
          }, 2000);
        } else {
          alert("Payment failed. Please try again.");
          setPaymentStep("IDLE");
          setLoading(false);
        }
      } catch (error) {
        alert("Something went wrong");
        setPaymentStep("IDLE");
        setLoading(false);
      }
    }, 2500);
  };

  if (paymentStep === "SUCCESS") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
          <Check size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">Payment Successful!</h2>
        <p className="text-neutral-500 text-lg">Your {selectedPlan.name} plan is now active.</p>
        <p className="text-neutral-400 text-sm mt-4">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 mb-8 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Plans
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Plan Details */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Order Summary</h2>
              <p className="text-sm text-neutral-500">Review your plan details</p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 mb-6 border border-neutral-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-neutral-800 text-lg">{selectedPlan.name} Plan</span>
              <span className="font-extrabold text-neutral-900 text-lg">₹{selectedPlan.price}</span>
            </div>
            <div className="text-sm text-neutral-500 flex justify-between">
              <span>Duration: {selectedPlan.duration}</span>
              <span>Billed once</span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-neutral-600 border-t border-neutral-100 pt-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-800">₹{selectedPlan.price}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-medium text-neutral-800">₹{Math.round(selectedPlan.price * 0.18)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-neutral-100 text-lg font-bold text-neutral-900">
              <span>Total Amount</span>
              <span>₹{selectedPlan.price + Math.round(selectedPlan.price * 0.18)}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Simulation */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Complete Payment</h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 relative overflow-hidden">
            {paymentStep === "PROCESSING" && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 size={40} className="animate-spin text-primary-600 mb-4" />
                <p className="font-bold text-neutral-800">Processing Payment...</p>
                <p className="text-sm text-neutral-500 mt-1 text-center px-6">Please do not close this window or click back.</p>
              </div>
            )}

            <p className="text-neutral-500 text-sm mb-6 bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100">
              <strong>Simulated Payment:</strong> Since this is a test environment, clicking "Pay Now" will simulate a successful transaction without charging any real money.
            </p>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-14 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Pay ₹{selectedPlan.price + Math.round(selectedPlan.price * 0.18)} Now
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-neutral-400 font-medium">
              <ShieldCheck size={14} /> 100% Secure Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
