"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "I'm a Tenant needing help",
  "I'm a PG Owner (CRM / Listing support)",
  "Partner / Affiliate Program",
  "Urgent Support / Account Help",
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = `${formData.firstName} ${formData.lastName}`.trim();
    if (!name) {
      setErrorMsg("Please enter your name.");
      toast.error("Please enter your name.");
      return;
    }

    if (!formData.email) {
      setErrorMsg("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMsg("Please enter a message of at least 5 characters.");
      toast.error("Message is too short.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setIsSuccess(true);
      setSubmittedRef(data.enquiryId);
      toast.success("Enquiry submitted successfully! We'll be in touch soon.");
    } catch (err: any) {
      const msg = err.message || "Failed to submit enquiry. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: SUBJECT_OPTIONS[0],
      message: "",
    });
    setIsSuccess(false);
    setSubmittedRef(null);
    setErrorMsg(null);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl border border-neutral-100 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={36} />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 font-bold text-xs mb-3 border border-violet-100">
          <Sparkles size={12} />
          Reference #{submittedRef || "RECEIVED"}
        </span>

        <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">
          Message Sent Successfully!
        </h3>

        <p className="text-neutral-600 leading-relaxed max-w-md mx-auto mb-6 text-sm sm:text-base">
          Thank you for reaching out. We have logged your enquiry in our support center and our team has been notified. We will get back to you at{" "}
          <span className="font-semibold text-neutral-900">{formData.email}</span> shortly.
        </p>

        <div className="bg-neutral-50 rounded-2xl p-4 max-w-md mx-auto mb-8 border border-neutral-100 text-left text-xs space-y-1.5 text-neutral-600">
          <p>
            <strong className="text-neutral-800">Support Email:</strong> pgsathi.support@gmail.com
          </p>
          <p>
            <strong className="text-neutral-800">Direct Helpline:</strong> +91 9696110243
          </p>
          <p>
            <strong className="text-neutral-800">Response Time:</strong> Within 2-4 business hours
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-neutral-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Send us a message</h2>
          <p className="text-xs text-neutral-500 font-medium">We respond within a few hours</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-neutral-900"
              placeholder="Aftab"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-neutral-900"
              placeholder="Khan"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-neutral-900"
              placeholder="aftab@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">
              Phone / WhatsApp <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-neutral-900"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-700">Subject</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium appearance-none text-neutral-900 cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none font-medium text-neutral-900"
            placeholder="Tell us what you need help with or ask your question..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Submitting Enquiry...
            </>
          ) : (
            <>
              <Send size={18} /> Send Message
            </>
          )}
        </button>

        <p className="text-xs text-center text-neutral-400 mt-4">
          By submitting this form, you agree to our privacy policy. Your information is securely handled.
        </p>
      </form>
    </div>
  );
}
