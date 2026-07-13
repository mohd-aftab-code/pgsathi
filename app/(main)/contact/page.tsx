import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us - PGSathi",
  description: "Get in touch with the PGSathi team for support, partnerships, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      
      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-neutral-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="container-max section-padding relative z-10 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-violet-50 text-violet-700 font-bold text-sm mb-6 border border-violet-100">
            We're here to help
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 tracking-tight">
            Get in touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">PGSathi</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Whether you have a question about finding a PG, using our CRM software, or just want to say hi, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      <div className="container-max section-padding py-16 md:py-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 max-w-6xl mx-auto items-start">
          
          {/* ── Contact Information (Left Col) ── */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Let's start a conversation</h2>
              <p className="text-neutral-600 leading-relaxed">
                Choose the most convenient way to reach us. We typically respond within a few hours during business days.
              </p>
            </div>
            
            <div className="space-y-6 mt-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Call Us</h3>
                  <p className="text-neutral-500 text-sm mb-3">Mon-Sat from 9am to 6pm.</p>
                  <a href="tel:+919696110243" className="text-primary-600 font-bold hover:underline text-lg inline-block">
                    +91 9696110243
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Email Support</h3>
                  <p className="text-neutral-500 text-sm mb-3">Drop us a line anytime.</p>
                  <a href="mailto:pgsathi.support@gmail.com" className="text-primary-600 font-bold hover:underline text-lg inline-block">
                    pgsathi.support@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Visit HQ</h3>
                  <p className="text-neutral-500 text-sm mb-3">Come say hello.</p>
                  <address className="text-neutral-900 font-medium not-italic leading-relaxed">
                    Sector 62, Noida<br />
                    Uttar Pradesh, India 201309
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* ── Contact Form (Right Col) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-neutral-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Send us a message</h2>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">First Name</label>
                    <input type="text" className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">Last Name</label>
                    <input type="text" className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" required className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Subject</label>
                  <select className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium appearance-none">
                    <option>General Inquiry</option>
                    <option>I'm a Tenant needing help</option>
                    <option>I'm a PG Owner (CRM / Listing support)</option>
                    <option>Partnerships / Business</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">Message <span className="text-red-500">*</span></label>
                  <textarea rows={5} required className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none font-medium" placeholder="How can we help you?"></textarea>
                </div>

                <button type="button" className="btn-primary w-full py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform shadow-lg shadow-primary-500/30">
                  <Send size={18} /> Send Message
                </button>
                <p className="text-xs text-center text-neutral-400 mt-4">By submitting this form, you agree to our privacy policy.</p>
              </form>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* ── CTA Section ── */}
      <section className="bg-neutral-900 py-16">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Want to list your PG or find a room immediately?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto">
              Find a PG
            </Link>
            <Link href="/dashboard/owner/listings/new" className="bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 px-8 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto">
              Join as PG Owner
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
