import { constructMetadata } from "@/lib/seo";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata = constructMetadata({
  title: "Frequently Asked Questions | PGSathi Support & Help",
  description: "Find clear answers to common questions about zero brokerage PGs, booking hostels, owner listings, and rent management on PGSathi.",
  canonicalPath: "/faq",
  keywords: ["PGSathi FAQ", "Zero brokerage PG questions", "Hostel booking help", "PG owner listing FAQ"],
});

export default function FAQPage() {
  const faqs = [
    {
      q: "Does PGSathi charge any brokerage?",
      a: "No! PGSathi is a 100% zero-brokerage platform. You can contact PG owners directly via WhatsApp or phone call and book your PG without paying any middleman fees or contact unlock charges."
    },
    {
      q: "How do I know the PG listings are genuine and verified?",
      a: "Our team verifies properties before listing them on our platform to ensure safety and authenticity by checking address, photos, and owner identity. Look for the 'VERIFIED' badge on listings."
    },
    {
      q: "Does PGSathi provide PG Management Software or CRM for hostel owners?",
      a: "Yes! PGSathi provides a complete cloud-based PG Manager CRM featuring real-time bed & room vacancy tracking, 1-click WhatsApp rent dues collection with UPI integration, paperless tenant Aadhaar KYC, meal mess schedulers, and profit/loss expense accounting."
    },
    {
      q: "In which cities is PGSathi available?",
      a: "PGSathi is available across major educational and corporate hubs in India including Noida, Greater Noida, Delhi NCR, Gurgaon, Bangalore, Pune, Kota, Hyderabad, Patna, Mumbai, Lucknow, and Jaipur."
    },
    {
      q: "How is PGSathi different from NoBroker or Rentok?",
      a: "Unlike generic classifieds like NoBroker that treat PGs like residential apartments and often hide owner contacts behind paid tenant plans, PGSathi offers 100% free direct owner contacts and bed-level sharing logic (single, double, triple sharing). Unlike Rentok, PGSathi provides both a high-traffic public search marketplace and an easy-to-use PG CRM."
    },
    {
      q: "Is the security deposit refundable?",
      a: "Yes, security deposits are generally refundable when you vacate the PG, provided you have served the required notice period and there is no damage to the property. Please confirm the exact terms with the PG owner before moving in."
    },
    {
      q: "Can I list my own PG on PGSathi?",
      a: "Absolutely! If you are a PG owner or manager, you can list 1 PG completely free forever on public search and get a 15-day free trial of the full PG Manager CRM to receive direct tenant leads on WhatsApp."
    },
    {
      q: "How can I contact a PG owner on PGSathi?",
      a: "You can find the owner's direct WhatsApp and phone call buttons on every PG listing page. There are no middleman brokers and no unlock fees."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pgsathi.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "FAQ",
        "item": "https://pgsathi.in/faq"
      }
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
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
            <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white font-medium rounded-lg hover:bg-violet-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
