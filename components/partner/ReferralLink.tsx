"use client";
import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: "List your PG on PGSathi", url: link });
    } else {
      copy();
    }
  };

  return (
    <div className="mt-3 flex items-center max-w-lg bg-white/60 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="flex-1 px-3 py-2 text-[11px] sm:text-xs font-medium text-neutral-500 truncate select-all">{link}</div>
      <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors border-l border-neutral-200/60 dark:border-neutral-800">
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
      </button>
      <button onClick={share} className="flex sm:hidden items-center gap-1.5 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold transition-colors border-l border-neutral-200/60 dark:border-neutral-800">
        <Share2 size={14} /> Share
      </button>
    </div>
  );
}
