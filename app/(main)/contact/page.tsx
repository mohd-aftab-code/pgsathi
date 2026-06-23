import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata = {
  title: "Contact Us - PGSathi",
  description: "Get in touch with the PGSathi team for support, partnerships, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16 md:py-24">
      <div className="container-max section-padding">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            We'd love to hear from you
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Whether you have a question about listings, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Call Us</h3>
                    <p className="text-neutral-500 text-sm mb-2">Mon-Sat from 9am to 6pm.</p>
                    <a href="tel:+919696110243" className="text-primary-600 font-bold hover:underline text-lg">
                      +91 9696110243
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Email Us</h3>
                    <p className="text-neutral-500 text-sm mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:pgsathi@gmail.com" className="text-primary-600 font-bold hover:underline text-lg">
                      pgsathi@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Visit Us</h3>
                    <p className="text-neutral-500 text-sm mb-2">Come say hello at our NCR office HQ.</p>
                    <p className="text-neutral-900 font-medium">
                      Sector 62, Noida<br />
                      Uttar Pradesh, India 201309
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-neutral-100">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Phone Number (Optional)</label>
                <input type="tel" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="+91 98765 43210" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button type="button" className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
