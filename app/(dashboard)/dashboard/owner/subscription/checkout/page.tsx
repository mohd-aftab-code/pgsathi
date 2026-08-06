"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, ArrowLeft, CreditCard, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { PLANS, isValidPlanId, GST_RATE } from "@/lib/plans";
import { availableCycles, cycleSavingPercent, effectiveMonthly, isValidCycle, type CycleId } from "@/lib/billing";

type PlanShape = {
  name: string;
  price: number;
  quarterlyPrice?: number | null;
  halfYearlyPrice?: number | null;
  yearlyPrice?: number | null;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("plan") ?? "basic"; // any slug; the server validates at payment
  const cycleParam = searchParams?.get("cycle");

  // Plan shown here comes from the DB (super-admin controlled). Start from the
  // hardcoded fallback so the first paint has a value, then replace with the
  // live DB row. The real charge is derived server-side, so display can't be gamed.
  const fallback: PlanShape = isValidPlanId(planId)
    ? { name: PLANS[planId].name, price: PLANS[planId].price }
    : { name: planId, price: 0 };
  const [selectedPlan, setSelectedPlan] = useState<PlanShape>(fallback);
  const [cycle, setCycle] = useState<CycleId>(isValidCycle(cycleParam) ? cycleParam : "MONTHLY");

  useEffect(() => {
    let alive = true;
    fetch("/api/plans/public")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.success) return;
        const hit = (d.data as any[]).find((p) => p.slug === planId);
        if (hit) setSelectedPlan(hit);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [planId]);

  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");
  // Inline, specific errors. A browser alert() gives no room to say what the
  // owner should actually DO — and "paid but not activated" needs saying loudly.
  const [error, setError] = useState<{ title: string; body: string; charged: boolean } | null>(null);

  const cycles = availableCycles(selectedPlan);
  // If the plan stops offering the selected cycle, fall back to what it does offer
  // rather than showing a price the server would reject.
  const active = cycles.find((c) => c.cycle === cycle) ?? cycles[0];
  const effectiveCycle: CycleId = active?.cycle ?? "MONTHLY";

  // Listed prices are GST-inclusive — the breakdown is only for the invoice view.
  const totalAmount = active?.price ?? selectedPlan.price;
  const baseAmount = Math.round(totalAmount / (1 + GST_RATE));
  const gstAmount = totalAmount - baseAmount;

  const handlePayment = async () => {
    if (totalAmount === 0) {
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
        body: JSON.stringify({ planId, billingCycle: effectiveCycle }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError({ title: "Payment shuru nahi ho paaya", body: data.message || "Order banane mein dikkat aayi. Thodi der baad dobara koshish kijiye.", charged: false });
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
        setError({ title: "Payment fail ho gaya", body: (response?.error?.description || "Bank ne payment reject kar diya.") + " Agar aapke account se paisa kata hai to 5-7 working din mein wapas aa jayega.", charged: true });
        setPaymentStep("IDLE");
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      setError({ title: "Payment window nahi khul paayi", body: "Internet check karke dobara koshish kijiye. Aapse abhi tak koi paisa nahi liya gaya.", charged: false });
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
          billingCycle: effectiveCycle,
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
        setError({ title: "Paisa kat gaya par plan chalu nahi hua", body: (data.message || "") + " Ghabraiye mat - payment record ho chuka hai. Subscription page kholiye, wahan payment history dikhegi. Plan phir bhi na chale to team ko call kar lijiye, paisa kahin nahi jaata.", charged: true });
        setPaymentStep("IDLE");
        setLoading(false);
      }
    } catch (error) {
      setError({ title: "Paisa kat gaya par plan chalu nahi hua", body: "Payment ho chuka hai. Subscription page par jaakar payment history dekhiye. Plan na dikhe to team ko call kar lijiye - paisa kahin nahi jaata.", charged: true });
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
          {totalAmount === 0 ? "Plan Activated!" : "Payment Successful!"}
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

      {/* `charged` decides the tone: money moved means reassure and route to
          support, money didn't means just let them retry. */}
      {error && (
        <div
          className={`mb-6 rounded-2xl border-2 p-5 ${
            error.charged ? "border-amber-300 bg-amber-50" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className={error.charged ? "text-amber-600 shrink-0 mt-0.5" : "text-red-500 shrink-0 mt-0.5"} size={20} />
            <div className="min-w-0 flex-1">
              <h3 className={`font-bold ${error.charged ? "text-amber-900" : "text-red-900"}`}>{error.title}</h3>
              <p className={`text-sm mt-1 ${error.charged ? "text-amber-800" : "text-red-800"}`}>{error.body}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {error.charged ? (
                  <>
                    <Link href="/dashboard/owner/subscription" className="inline-flex items-center h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold">
                      Payment history dekhein
                    </Link>
                    <a href="tel:+919696110243" className="inline-flex items-center h-10 px-4 rounded-xl border-2 border-amber-300 text-amber-800 text-sm font-bold">
                      +91 9696110243
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center h-10 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-bold"
                  >
                    Dobara koshish karein
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Plan Details */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center border border-violet-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Order Summary</h2>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Review your plan details</p>
            </div>
          </div>

          {/* Duration picker. Only cycles the plan actually prices are shown, so a
              buyer can never pick something the server would reject. */}
          {cycles.length > 1 && totalAmount > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-neutral-700 mb-2">Duration chunein</p>
              <div className="grid grid-cols-2 gap-2">
                {cycles.map(({ cycle: c, price, meta }) => {
                  const saving = cycleSavingPercent(selectedPlan, c);
                  const isOn = c === effectiveCycle;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCycle(c)}
                      className={`relative text-left rounded-2xl border-2 p-3 transition-colors ${
                        isOn ? "border-primary-500 bg-primary-50" : "border-neutral-200/60 hover:border-neutral-300"
                      }`}
                    >
                      {saving > 0 && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-xl bg-green-100 text-green-700">
                          {saving}% off
                        </span>
                      )}
                      <div className={`text-sm font-bold ${isOn ? "text-primary-700" : "text-neutral-800"}`}>{meta.label}</div>
                      <div className="text-lg font-extrabold text-neutral-900">₹{price.toLocaleString("en-IN")}</div>
                      {meta.months > 1 && (
                        <div className="text-[11px] text-neutral-500">₹{effectiveMonthly(price, c).toLocaleString("en-IN")}/month</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-neutral-50 rounded-2xl p-4 sm:p-6 mb-6 border border-neutral-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-neutral-800 text-lg">{selectedPlan.name} Plan</span>
              <span className="font-extrabold text-neutral-900 text-lg">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="text-sm text-neutral-500 flex justify-between">
              <span>Duration: {totalAmount === 0 ? "Free" : active?.meta.label ?? "1 Month"}</span>
              <span>{totalAmount === 0 ? "No charges" : "Billed once"}</span>
            </div>
          </div>

          {totalAmount > 0 && (
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
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pt-1">
                GST included — no extra charges at payment.
              </p>
            </div>
          )}
        </div>

        {/* Right: Payment Gateway */}
        <div>
          <h2 className="text-xl font-black text-neutral-900 mb-5 uppercase tracking-tight">
            {totalAmount === 0 ? "Activate Your Plan" : "Complete Payment"}
          </h2>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200/60 relative overflow-hidden">
            {paymentStep === "PROCESSING" && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 size={32} className="animate-spin text-violet-600 mb-3" />
                <p className="font-black text-xs uppercase tracking-wider text-neutral-800">
                  {totalAmount === 0 ? "Activating your plan..." : "Opening Secure Payment..."}
                </p>
                {totalAmount > 0 && (
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mt-1 text-center px-6">Powered by Razorpay</p>
                )}
              </div>
            )}

            {totalAmount === 0 ? (
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
              {totalAmount === 0 ? "Activate Free Plan" : `Pay ₹${totalAmount} via Razorpay`}
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-medium">
              <ShieldCheck size={14} />
              {totalAmount === 0 ? "No card or payment details needed" : "100% Secure Encrypted Payment"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
