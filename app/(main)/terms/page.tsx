import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service - PGSathi",
  description: "Read the Terms of Service for using the PGSathi platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-primary-900 pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="container-max max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-primary-300 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Terms of Service</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center text-primary-300">
              <FileText size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-primary-200 text-lg">Last updated: June 23, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-max max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl shadow-neutral-200/50 border border-neutral-100">
          
          <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-primary-600 prose-li:text-neutral-600">
            <p className="lead text-xl text-neutral-500 font-medium mb-10">
              By accessing and using PGSathi (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. <strong>You must be at least 18 years of age</strong> to use this Platform and enter into any rental agreements.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">1. Description of Service</h2>
                <p>PGSathi provides an online platform connecting PG (Paying Guest) owners with potential tenants. We do not own, manage, or operate any of the properties listed on the Platform. We act solely as a facilitator connecting the two parties without charging any brokerage from tenants.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">2. User Obligations & Legal Disclaimers</h2>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-orange-800 mt-0 mb-2">Police Verification & KYC (Critical)</h3>
                  <p className="text-orange-700 mb-0">PGSathi does not conduct background checks on tenants or owners. <strong>It is the sole responsibility of the PG Owner to conduct Police Verification and collect valid KYC documents (Aadhaar, PAN, etc.)</strong> of the tenants as per local government regulations before moving in. PGSathi holds zero liability for any illegal activities committed by the users.</p>
                </div>
                <ul className="list-disc pl-5 space-y-3">
                  <li><strong>Accuracy of Information:</strong> You agree to provide true, accurate, current, and complete information when creating an account or listing a property.</li>
                  <li><strong>Prohibited Conduct:</strong> You agree not to use the Platform for any unlawful purpose, to harass others, or to upload malicious content.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">3. Property Listings and Payments</h2>
                <p>Owners are solely responsible for the accuracy of their listings, including pricing, amenities, and availability. Any agreements or rent payments made between tenants and owners are strictly between those two parties. PGSathi is not liable for any financial disputes, refunds, or damages arising from the rental agreement.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">4. Refund & Cancellation Policy (For Premium Owners)</h2>
                <p>Owners may opt to purchase premium subscriptions to enhance their listing visibility. Payments are processed securely via third-party gateways (e.g., Razorpay). Please note our policy regarding these digital services:</p>
                <ul className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mt-4 space-y-3">
                  <li><strong className="text-neutral-900">Non-Refundable:</strong> All premium subscription fees paid to PGSathi are strictly non-refundable once the service is activated.</li>
                  <li><strong className="text-neutral-900">Cancellations:</strong> You may cancel your subscription renewal at any time from your dashboard, but no partial refunds will be issued for the remaining days of the active billing cycle.</li>
                  <li><strong className="text-neutral-900">Transaction Failures:</strong> In case money is deducted from your bank account but the subscription is not activated due to a technical error, the amount will be automatically refunded to your original payment method within 5-7 working days by our payment gateway partner.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">5. Limitation of Liability</h2>
                <p>PGSathi shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">6. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will notify users of any significant changes.</p>
              </section>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
