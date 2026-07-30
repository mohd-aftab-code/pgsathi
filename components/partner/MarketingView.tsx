"use client";

import { useState } from "react";
import { Copy, CheckCircle2, MessageCircle, Link as LinkIcon, Download } from "lucide-react";

export function MarketingView({
  partnerCode,
  appUrl,
}: {
  partnerCode: string;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${appUrl}/register?ref=${partnerCode}`;
  
  const whatsappText = encodeURIComponent(
    `Hello! Register your PG on PGSathi, India's fast-growing zero brokerage platform.\n\nUse my referral link to sign up as an Owner:\n${referralLink}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-lg mb-2">Your Referral Link</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
          Share this link with PG Owners. When they register using this link, they will be automatically added to your "Mere Owners" list.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <LinkIcon size={16} className="text-neutral-400" />
            </div>
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full h-11 pl-10 pr-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 outline-none"
            />
          </div>
          <button
            onClick={handleCopy}
            className="h-11 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 shrink-0"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Share Card */}
        <div className="rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Share on WhatsApp</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
            Directly send a pre-written message with your referral link to any PG Owner.
          </p>
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-colors w-full sm:w-auto"
          >
            Open WhatsApp
          </a>
        </div>

        {/* Marketing Material Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Download size={24} />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Promotional Creatives</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
            Download PGSathi banners and flyers to share on your social media or print them.
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex h-10 items-center justify-center gap-2 px-5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-sm transition-colors w-full sm:w-auto opacity-50 cursor-not-allowed"
          >
            Download Kit (Coming soon)
          </a>
        </div>
      </div>
    </div>
  );
}
