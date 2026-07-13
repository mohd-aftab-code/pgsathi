import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | PGSathi",
  description: "Read our refund and cancellation policy for bookings, tokens, and subscriptions on PGSathi.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-max section-padding px-4 sm:px-6 py-10 md:py-20">
        <div className="max-w-4xl mx-auto bg-white p-5 sm:p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-violet-600">
            <p className="lead text-lg mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Token Amount & Booking Cancellations</h2>
            <p>
              When you book a visit or reserve a bed/room through PGSathi, the token amount is generally non-refundable unless specified otherwise by the PG Owner. 
              If the PG owner cancels your booking due to unavailability, you are entitled to a full refund of your token amount.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Security Deposits</h2>
            <p>
              Security deposits are held directly by the PG Owners, not by PGSathi. The refund of your security deposit is subject to the terms agreed upon in your rental agreement with the PG owner. Usually, this requires serving a standard notice period (e.g., 30 days) and ensuring no damages to the property.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Subscription & Premium Services (For Owners)</h2>
            <p>
              For PG owners using our premium listing plans or management tools:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-600">
              <li>Subscriptions are billed in advance on a monthly or annual basis and are non-refundable for the active billing period.</li>
              <li>You may cancel your subscription at any time, and you will continue to have access to the premium features until the end of your current billing cycle.</li>
              <li>No prorated refunds will be issued for partial months of service.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Failed Transactions</h2>
            <p>
              If a transaction fails but money is deducted from your account, it will automatically be refunded to the original payment method within 5-7 business days by our payment gateway partner.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. How to Request a Refund</h2>
            <p>
              If you believe you are entitled to a refund based on this policy, please contact our support team at <a href="mailto:pgsathi.support@gmail.com">pgsathi.support@gmail.com</a> with your transaction details, booking ID, and reason for the refund request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
