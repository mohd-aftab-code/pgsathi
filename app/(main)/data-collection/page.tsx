import { Database, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Data Collection Policy - PGSathi",
  description: "Learn about how PGSathi collects, stores, and uses your data.",
};

export default function DataCollectionPage() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-primary-900 pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="container-max relative z-10">
          <div className="flex items-center gap-2 text-primary-300 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Data Collection Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center text-primary-300">
              <Database size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Data Collection Policy</h1>
          </div>
          <p className="text-primary-200 text-lg">Last updated: August 07, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-max px-4 sm:px-6 -mt-20 relative z-20 mb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl shadow-neutral-200/50 border border-neutral-100 max-w-5xl mx-auto">
          
          <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-primary-600 prose-li:text-neutral-600">
            <p className="lead text-xl text-neutral-500 font-medium mb-10">
              At PGSathi, we believe in full transparency regarding the data we collect. This Data Collection Policy outlines the specific types of data we gather from our users, how it is collected, and the primary purpose behind its collection to provide you with a seamless and secure experience.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">1. Types of Data We Collect</h2>
                <p>We collect information to provide better services to all our users. The data we collect includes:</p>
                <ul className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mt-4 space-y-3">
                  <li><strong className="text-neutral-900">Personal Identification Information:</strong> Name, email address, phone number, and ID proofs (when required for tenant verification).</li>
                  <li><strong className="text-neutral-900">Property Details (For Owners):</strong> Location, property images, amenities, pricing, and ownership proofs.</li>
                  <li><strong className="text-neutral-900">Usage Data:</strong> Information about how you interact with our platform, pages visited, search queries, and time spent on the app.</li>
                  <li><strong className="text-neutral-900">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">2. Methods of Data Collection</h2>
                <p>Your data is collected through the following methods:</p>
                <ul className="list-disc pl-5 space-y-3 mt-4 text-neutral-600">
                  <li><strong>Directly from you:</strong> When you register an account, fill out a profile, list a property, or contact our support team.</li>
                  <li><strong>Automatically:</strong> As you navigate through the site, data may be collected automatically using cookies, log files, and similar tracking technologies.</li>
                  <li><strong>From third parties:</strong> We may receive data from business partners, social media integrations, or verification agencies.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">3. Purpose of Collection</h2>
                <p>The primary purposes for collecting this data include:</p>
                <ul className="list-disc pl-5 space-y-3 mt-4 text-neutral-600">
                  <li>Facilitating the connection between PG owners and tenants.</li>
                  <li>Verifying identities to ensure trust and safety across the platform.</li>
                  <li>Improving our services, personalizing content, and optimizing user experience.</li>
                  <li>Providing customer support and responding to inquiries.</li>
                  <li>Processing payments securely and maintaining transaction records.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">4. Data Retention</h2>
                <p>We retain your personal data only for as long as is necessary for the purposes set out in this Data Collection Policy, or to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies. Once the data is no longer necessary, it is securely deleted or anonymized.</p>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">5. Your Control Over Data</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-3 mt-4 text-neutral-600">
                  <li>Request access to the personal data we hold about you.</li>
                  <li>Request correction of incomplete or inaccurate data.</li>
                  <li>Request erasure of your personal data when there is no good reason for us continuing to process it.</li>
                  <li>Opt-out of marketing communications at any time.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl border-b border-neutral-100 pb-3 mb-6">6. Contact Us</h2>
                <p>If you have any questions or concerns regarding our data collection practices, please feel free to reach out to our privacy team:</p>
                
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mt-6 max-w-md">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 mt-0">Privacy Support</h3>
                  <p className="mb-2"><strong>Email:</strong> <a href="mailto:pgsathi.support@gmail.com">pgsathi.support@gmail.com</a></p>
                  <p className="mb-2"><strong>Phone:</strong> +91 9696110243</p>
                  <p className="mb-0"><strong>Time:</strong> Mon - Fri (9:00 AM to 6:00 PM)</p>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
