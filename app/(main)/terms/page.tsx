import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - PGSathi",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16 md:py-24">
      <div className="container-max max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8">
            <FileText size={32} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-neutral-500 mb-10">Last updated: June 23, 2026</p>

          <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">1. Acceptance of Terms & Age Restriction</h2>
            <p>By accessing and using PGSathi (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. <strong>You must be at least 18 years of age</strong> to use this Platform and enter into any rental agreements.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">2. Description of Service</h2>
            <p>PGSathi provides an online platform connecting PG (Paying Guest) owners with potential tenants. We do not own, manage, or operate any of the properties listed on the Platform. We act solely as a facilitator connecting the two parties without charging any brokerage from tenants.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">3. User Obligations & Legal Disclaimers</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Accuracy of Information:</strong> You agree to provide true, accurate, current, and complete information when creating an account or listing a property.</li>
              <li><strong>Police Verification & KYC (Critical):</strong> PGSathi does not conduct background checks on tenants or owners. <strong>It is the sole responsibility of the PG Owner to conduct Police Verification and collect valid KYC documents (Aadhaar, PAN, etc.)</strong> of the tenants as per local government regulations before moving in. PGSathi holds zero liability for any illegal activities committed by the users.</li>
              <li><strong>Prohibited Conduct:</strong> You agree not to use the Platform for any unlawful purpose, to harass others, or to upload malicious content.</li>
            </ul>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">4. Property Listings and Payments</h2>
            <p>Owners are solely responsible for the accuracy of their listings, including pricing, amenities, and availability. Any agreements or rent payments made between tenants and owners are strictly between those two parties. PGSathi is not liable for any financial disputes, refunds, or damages arising from the rental agreement.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">5. Refund & Cancellation Policy (For Premium Owners)</h2>
            <p>Owners may opt to purchase premium subscriptions to enhance their listing visibility. Payments are processed securely via third-party gateways (e.g., Razorpay). Please note our policy regarding these digital services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Non-Refundable:</strong> All premium subscription fees paid to PGSathi are strictly non-refundable once the service is activated.</li>
              <li><strong>Cancellations:</strong> You may cancel your subscription renewal at any time from your dashboard, but no partial refunds will be issued for the remaining days of the active billing cycle.</li>
              <li><strong>Transaction Failures:</strong> In case money is deducted from your bank account but the subscription is not activated due to a technical error, the amount will be automatically refunded to your original payment method within 5-7 working days by our payment gateway partner.</li>
            </ul>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">6. Limitation of Liability</h2>
            <p>PGSathi shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will notify users of any significant changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
