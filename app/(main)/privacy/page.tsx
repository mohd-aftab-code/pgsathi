import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - PGSathi",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16 md:py-24">
      <div className="container-max max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
            <Shield size={32} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-neutral-500 mb-10">Last updated: June 23, 2026</p>

          <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">1. Introduction</h2>
            <p>Welcome to PGSathi. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">2. The Data We Collect About You</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment partners).</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback and survey responses.</li>
            </ul>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">3. How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., connecting tenants with owners).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

            <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">5. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us in the following ways:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email address: pgsathi@gmail.com</li>
              <li>Phone number: +91 9696110243</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
