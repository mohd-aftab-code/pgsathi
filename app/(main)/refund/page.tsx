import { RefreshCcw, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy | PGSathi",
  description: "Read our refund and cancellation policy for bookings, tokens, and subscriptions on PGSathi.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-primary-900 pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="container-max relative z-10">
          <div className="flex items-center gap-2 text-primary-300 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Refund Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center text-primary-300">
              <RefreshCcw size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Refund & Cancellation Policy</h1>
          </div>
          <p className="text-primary-200 text-lg">Last updated: June 23, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-max px-4 sm:px-6 -mt-20 relative z-20 mb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl shadow-neutral-200/50 border border-neutral-100 max-w-5xl mx-auto">
          
          <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-primary-600 prose-li:text-neutral-600">
            <p className="lead text-xl text-neutral-500 font-medium mb-10">
              Please read this policy carefully to understand our practices regarding refunds and cancellations for bookings, tokens, and premium subscriptions on the PGSathi platform.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">1. Token Amount & Booking Cancellations</h2>
                <p>When you book a visit or reserve a bed/room through PGSathi, the token amount is generally non-refundable unless specified otherwise by the PG Owner. If the PG owner cancels your booking due to unavailability, you are entitled to a full refund of your token amount.</p>
                <ul className="list-disc pl-5 space-y-3 mt-4 text-neutral-600">
                  <li><strong>Tenant Cancellation:</strong> If you cancel your booking after paying a token, the PG owner reserves the right to forfeit the token amount as compensation for holding the bed.</li>
                  <li><strong>Owner Cancellation:</strong> If the owner fails to provide the accommodation as promised, they are liable to refund the token amount in full.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">2. Security Deposits</h2>
                <p>Security deposits are held directly by the PG Owners, not by PGSathi. The refund of your security deposit is subject to the terms agreed upon in your rental agreement with the PG owner. Usually, this requires serving a standard notice period (e.g., 30 days) and ensuring no damages to the property.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">3. Subscription & Premium Services (For Owners)</h2>
                <p>For PG owners using our premium listing plans or management tools:</p>
                <ul className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mt-4 space-y-3">
                  <li><strong className="text-neutral-900">Non-Refundable:</strong> Subscriptions are billed in advance on a monthly or annual basis and are non-refundable for the active billing period.</li>
                  <li><strong className="text-neutral-900">Cancellation:</strong> You may cancel your subscription at any time, and you will continue to have access to the premium features until the end of your current billing cycle.</li>
                  <li><strong className="text-neutral-900">Prorated Refunds:</strong> No prorated refunds will be issued for partial months of service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">4. Failed Transactions & Technical Errors</h2>
                <p>If a transaction fails but money is deducted from your account, it will automatically be refunded to the original payment method within 5-7 business days by our payment gateway partner.</p>
                <p className="mt-2 text-sm text-neutral-500">Note: PGSathi does not hold failed transaction funds. They are automatically reversed by the banking network (NPCI/Visa/Mastercard) and your bank.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">5. How to Request a Refund</h2>
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
                  <p className="text-primary-800 mb-0">
                    If you believe you are entitled to a refund based on this policy, please contact our support team at <strong><a href="mailto:pgsathi.support@gmail.com" className="text-primary-600 hover:underline">pgsathi.support@gmail.com</a></strong> with your transaction details, booking ID, and reason for the refund request.
                  </p>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
