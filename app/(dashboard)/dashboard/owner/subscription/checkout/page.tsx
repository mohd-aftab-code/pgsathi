"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

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

  const totalAmount = selectedPlan.price + Math.round(selectedPlan.price * 0.18);

  const handlePayment = async () => {
    if (selectedPlan.price === 0) {
      // Free plan logic
      activateSubscription({});
      return;
    }

    setLoading(true);
    setPaymentStep("PROCESSING");

    try {
      // 1. Create order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Failed to create order: ${data.message}`);
        setPaymentStep("IDLE");
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: totalAmount * 100,
        currency: "INR",
        name: "PGSathi",
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: data.orderId,
        handler: function (response: any) {
          // 3. Verify and activate on success
          activateSubscription({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: "Owner",
          email: "owner@pgsathi.in",
          contact: "9999999999"
        },
        theme: {
          color: "#f97316" // Tailwind orange-500
        },
        modal: {
          ondismiss: function() {
            setPaymentStep("IDLE");
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setPaymentStep("IDLE");
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      alert("Something went wrong initializing payment");
      setPaymentStep("IDLE");
      setLoading(false);
    }
  };

  const activateSubscription = async (paymentDetails: any) => {
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId, 
          amount: selectedPlan.price,
          ...paymentDetails 
        }),
      });

      if (res.ok) {
        setPaymentStep("SUCCESS");
        setTimeout(() => {
          router.push("/dashboard/owner/subscription");
          router.refresh();
        }, 2000);
      } else {
        const data = await res.json();
        alert(`Activation failed: ${data.message}`);
        setPaymentStep("IDLE");
        setLoading(false);
      }
    } catch (error) {
      alert("Failed to activate subscription after payment.");
      setPaymentStep("IDLE");
      setLoading(false);
    }
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
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
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Gateway */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Complete Payment</h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 relative overflow-hidden">
            {paymentStep === "PROCESSING" && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 size={40} className="animate-spin text-primary-600 mb-4" />
                <p className="font-bold text-neutral-800">Opening Secure Payment...</p>
                <p className="text-sm text-neutral-500 mt-1 text-center px-6">Powered by Razorpay</p>
              </div>
            )}

            <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
              <CreditCard className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="text-green-800 block mb-1">UPI & Cards Accepted</strong>
                <p className="text-green-700 text-sm">Pay securely via Google Pay, PhonePe, Paytm, or Credit/Debit cards.</p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-14 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Pay ₹{totalAmount} via Razorpay
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
