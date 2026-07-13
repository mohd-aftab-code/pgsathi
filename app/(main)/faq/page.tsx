import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | PGSathi",
  description: "Find answers to commonly asked questions about renting PGs, booking hostels, and managing properties on PGSathi.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Does PGSathi charge any brokerage?",
      a: "No! PGSathi is a zero-brokerage platform. You can contact owners directly and book your PG without paying any middleman fees."
    },
    {
      q: "How do I know the PG listings are genuine?",
      a: "We verify the properties before listing them on our platform to ensure safety and authenticity. Look for the 'Verified' badge on listings."
    },
    {
      q: "Is the security deposit refundable?",
      a: "Yes, security deposits are generally refundable when you vacate the PG, provided you have served the required notice period and there is no damage to the property. Please confirm the exact terms with the PG owner before moving in."
    },
    {
      q: "Can I list my own PG on PGSathi?",
      a: "Absolutely! If you are a PG owner or manager, you can create a free account and list your property to get leads directly from tenants."
    },
    {
      q: "How can I contact a PG owner?",
      a: "You can find the owner's contact details on the PG listing page, or you can fill out the enquiry form, and the owner will get back to you."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-max section-padding px-4 sm:px-6 py-10 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-slate-600 text-lg">Have a question? We're here to help.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className={`p-5 sm:p-6 md:p-8 ${index !== faqs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-violet-50 p-6 sm:p-8 rounded-2xl border border-violet-100">
            <h2 className="text-xl font-semibold text-violet-900 mb-2">Still have questions?</h2>
            <p className="text-violet-700 mb-6">Can't find the answer you're looking for? Please contact our friendly team.</p>
            <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
