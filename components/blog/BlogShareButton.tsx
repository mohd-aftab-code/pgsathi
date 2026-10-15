"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

export function BlogShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://pgsathi.in/blog/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read "${title}" on PGSathi:`,
          url,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err: any) {
        // User cancelled or share failed, fallback to copy
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-neutral-100 hover:bg-primary-50 text-neutral-700 hover:text-primary-600 transition-colors border border-neutral-200 cursor-pointer shadow-sm active:scale-95"
      title="Share or Copy Link"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-600" />
          <span className="text-emerald-700">Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
