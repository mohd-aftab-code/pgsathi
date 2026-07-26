import { Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - PGSathi",
  description: "Learn how PGSathi protects your privacy and personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-primary-900 pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="container-max max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-primary-300 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Privacy Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center text-primary-300">
              <Shield size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-primary-200 text-lg">Last updated: June 23, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-max max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl shadow-neutral-200/50 border border-neutral-100">
          
          <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-primary-600 prose-li:text-neutral-600">
            <p className="lead text-xl text-neutral-500 font-medium mb-10">
              Welcome to PGSathi. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">1. Introduction</h2>
                <p>Welcome to PGSathi. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">2. The Data We Collect About You</h2>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mt-4 space-y-3">
                  <li><strong className="text-neutral-900">Identity Data:</strong> First name, last name, username or similar identifier.</li>
                  <li><strong className="text-neutral-900">Contact Data:</strong> Billing address, delivery address, email address and telephone numbers.</li>
                  <li><strong className="text-neutral-900">Financial Data:</strong> Bank account and payment card details (processed securely via our payment partners).</li>
                  <li><strong className="text-neutral-900">Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</li>
                  <li><strong className="text-neutral-900">Profile Data:</strong> Your username and password, your interests, preferences, feedback and survey responses.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">3. How We Use Your Personal Data</h2>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., connecting tenants with owners).</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">4. Data Security</h2>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">5. Contact Us & Grievance Officer</h2>
                <p>If you have any questions about this privacy policy or our privacy practices, please contact us in the following ways:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 mt-0">General Support</h3>
                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:pgsathi.support@gmail.com">pgsathi.support@gmail.com</a></p>
                    <p className="mb-0"><strong>Phone:</strong> +91 9696110243</p>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 mt-0">Grievance Officer</h3>
                    <p className="mb-2"><strong>Name:</strong> Grievance Officer, PGSathi</p>
                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:pgsathi.support@gmail.com">pgsathi.support@gmail.com</a></p>
                    <p className="mb-0"><strong>Time:</strong> Mon - Fri (9:00 AM to 6:00 PM)</p>
                  </div>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
