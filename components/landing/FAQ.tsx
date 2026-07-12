import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    q: "Kya PGSathi par PG dhoondhna sach mein zero brokerage hai?",
    a: "Haan. Tenants se hum kabhi koi fees nahi lete — search se le kar owner ka number lene tak, sab free hai. PG owners apni listing aur leads ke liye subscribe karte hain, isi se platform chalta hai. Aapko kisi bhi stage par brokerage nahi deni padti.",
  },
  {
    q: "Listings verify kaise hoti hain?",
    a: "Har naya PG hamari team review karti hai listing live hone se pehle — address, photos, aur owner details check hoti hain. Verified listings pe ek \"VERIFIED\" badge dikhta hai, taaki aap bharosa kar ke aage badh sakein.",
  },
  {
    q: "PG owner se contact kaise karu?",
    a: "Kisi bhi listing pe \"Contact Owner\" ya WhatsApp button milega — direct owner ke phone number pe connect hote ho, koi bichauliya nahi. Aap call bhi kar sakte ho ya visit book kar sakte ho.",
  },
  {
    q: "Kya main PGSathi ke through rent online pay kar sakta hoon?",
    a: "Abhi PGSathi ek discovery platform hai — hum aapko sahi PG dhoondhne aur owner se seedha connect karne mein madad karte hain. Rent payment aap owner ke saath directly settle karte ho (cash, UPI, ya jo bhi tareeka aap dono decide karo).",
  },
  {
    q: "Agar PG photos mein jaisa dikha waisa nahi nikla to?",
    a: "Hum listings verify karte hain, lekin final decision lene se pehle hamesha ek physical visit zaroor karein — har listing pe visit book karne ka option hota hai. Koi mismatch lage to hume report karein, hum listing ko dobara review karte hain.",
  },
  {
    q: "Girls ke liye PGs kitni safe hain?",
    a: "Girls PGs alag se filter kiye ja sakte hain, aur zyada tar mein warden/security ka setup hota hai — details har listing page pe milengi. Hum recommend karte hain ki final decision se pehle khud visit zaroor karein aur owner se safety measures directly poochh lein.",
  },
  {
    q: "Main PG owner hoon — apni property kaise list karu?",
    a: "\"List Your PG\" pe click karo, apni property ke details aur photos daalo — basic listing free hai. Zyada leads aur poora PG-management dashboard chahiye to paid plans available hain, jinme 15 din ka free trial bhi milta hai.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 md:py-24 bg-white border-t border-neutral-100">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          {/* Left: intro */}
          <div>
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
              <MessageCircleQuestion size={22} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4" style={{ textWrap: "balance" }}>
              Common Questions
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-6 max-w-sm">
              Kuch cheezein jo log PGSathi use karne se pehle poochte hain. Kuch aur poochna hai?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors"
            >
              Humse contact karein →
            </Link>
          </div>

          {/* Right: accordion — plain <details>, no JS needed */}
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQS.map((item, idx) => (
              <details key={idx} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="font-bold text-neutral-900 text-base md:text-lg">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-neutral-400 transition-transform duration-300 group-open:rotate-180 group-open:text-primary-600"
                  />
                </summary>
                <p className="text-neutral-600 leading-relaxed mt-3 pr-8">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
