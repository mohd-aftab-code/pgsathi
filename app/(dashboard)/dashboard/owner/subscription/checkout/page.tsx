"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { PLANS, isValidPlanId, GST_RATE } from "@/lib/plans";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("plan") ?? "basic"; // any slug; the server validates at payment

  // Plan shown here comes from the DB (super-admin controlled). Start from the
  // hardcoded fallback so the first paint has a value, then replace with the
  // live DB row. The real charge is derived server-side, so display can't be gamed.
  const fallback = isValidPlanId(planId)
    ? { name: PLANS[planId].name, price: PLANS[planId].price }
    : { name: planId, price: 0 };
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number }>(fallback);

  useEffect(() => {
    let alive = true;
    fetch("/api/plans/public")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.success) return;
        const hit = (d.data as any[]).find((p) => p.slug === planId);
        if (hit) setSelectedPlan({ name: hit.name, price: hit.price });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [planId]);

  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");

  // Listed prices are GST-inclusive — the breakdown is only for the invoice view.
  const totalAmount = selectedPlan.price;
  const baseAmount = Math.round(totalAmount / (1 + GST_RATE));
  const gstAmount = totalAmount - baseAmount;

  const handlePayment = async () => {
    if (selectedPlan.price === 0) {
      // Free plan logic
      activateSubscription({});
      return;
    }

    setLoading(true);
    setPaymentStep("PROCESSING");

    try {
      // 1. Create order on backend (server derives the amount from planId)
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
          <Check size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">
          {selectedPlan.price === 0 ? "Plan Activated!" : "Payment Successful!"}
        </h2>
        <p className="text-neutral-500 text-lg">Your {selectedPlan.name} plan is now active.</p>
        <p className="text-neutral-400 text-sm mt-4">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <Link href="/dashboard/owner/subscription/upgrade" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 mb-8 font-medium transition-colors">
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

          <div className="bg-neutral-50 rounded-2xl p-4 sm:p-6 mb-6 border border-neutral-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-neutral-800 text-lg">{selectedPlan.name} Plan</span>
              <span className="font-extrabold text-neutral-900 text-lg">₹{selectedPlan.price}</span>
            </div>
            <div className="text-sm text-neutral-500 flex justify-between">
              <span>Duration: {selectedPlan.price === 0 ? "Free" : "1 Month"}</span>
              <span>{selectedPlan.price === 0 ? "No charges" : "Billed once"}</span>
            </div>
          </div>

          {selectedPlan.price > 0 && (
            <div className="space-y-3 text-sm text-neutral-600 border-t border-neutral-100 pt-6">
              <div className="flex justify-between">
                <span>Taxable value</span>
                <span className="font-medium text-neutral-800">₹{baseAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-medium text-neutral-800">₹{gstAmount}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-100 text-lg font-bold text-neutral-900">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
              <p className="text-xs text-neutral-400 pt-1">
                GST included — no extra charges at payment.
              </p>
            </div>
          )}
        </div>

        {/* Right: Payment Gateway */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            {selectedPlan.price === 0 ? "Activate Your Plan" : "Complete Payment"}
          </h2>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 relative overflow-hidden">
            {paymentStep === "PROCESSING" && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 size={40} className="animate-spin text-primary-600 mb-4" />
                <p className="font-bold text-neutral-800">
                  {selectedPlan.price === 0 ? "Activating your plan..." : "Opening Secure Payment..."}
                </p>
                {selectedPlan.price > 0 && (
                  <p className="text-sm text-neutral-500 mt-1 text-center px-6">Powered by Razorpay</p>
                )}
              </div>
            )}

            {selectedPlan.price === 0 ? (
              <div className="mb-6 bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
                <ShieldCheck className="text-primary-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-primary-800 block mb-1">No Payment Required</strong>
                  <p className="text-primary-700 text-sm">This plan is free — click below to activate it instantly.</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                <CreditCard className="text-green-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-green-800 block mb-1">UPI & Cards Accepted</strong>
                  <p className="text-green-700 text-sm">Pay securely via Google Pay, PhonePe, Paytm, or Credit/Debit cards.</p>
                </div>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-14 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {selectedPlan.price === 0 ? "Activate Free Plan" : `Pay ₹${totalAmount} via Razorpay`}
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-neutral-400 font-medium">
              <ShieldCheck size={14} />
              {selectedPlan.price === 0 ? "No card or payment details needed" : "100% Secure Encrypted Payment"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
