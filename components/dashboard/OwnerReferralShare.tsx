"use client";

import { useState } from "react";
import { Copy, CheckCircle2, MessageCircle, Link as LinkIcon, Download } from "lucide-react";

/** The link, the QR, and a message that is already written. */
export function OwnerReferralShare({
  code,
  link,
  qrSvg,
  bonusDays,
}: {
  code: string;
  link: string;
  /** Rendered on the server — the QR encoder is Node-only. */
  qrSvg: string;
  bonusDays: number;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const message =
    `Namaste 🙏\n\n` +
    `Main apna PG PGSathi par manage karta hoon — listing free hai, tenants seedha contact karte hain, ` +
    `aur rent/tenant manage karne ka CRM bhi milta hai. Brokerage bilkul nahi.\n\n` +
    (bonusDays > 0 ? `Mere link se join karenge to aapko ${bonusDays} din extra free milenge:\n` : `Yahan se join kar sakte hain:\n`) +
    `${link}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
  };

  const downloadQr = () => {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pgsathi-refer-${code}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 mb-1">Aapka referral link</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Link 30 din tak yaad rehta hai — koi aaj kholkar agle hafte join kare, tab bhi aapka hi credit rahega.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <LinkIcon size={15} className="absolute inset-y-0 left-3 my-auto h-4 text-neutral-400" />
            <input
              readOnly
              value={link}
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none"
            />
          </div>
          <button
            onClick={() => copy(link, "link")}
            className="h-11 px-5 rounded-xl border-2 border-violet-500 text-violet-600 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-violet-50"
          >
            {copied === "link" ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied === "link" ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Ready message</p>
          <pre className="whitespace-pre-wrap text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 font-sans leading-relaxed">
            {message}
          </pre>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={() => copy(message, "msg")}
              className="h-10 px-4 rounded-xl border-2 border-neutral-200 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-neutral-50"
            >
              {copied === "msg" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied === "msg" ? "Copied!" : "Message copy"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col items-center text-center">
        <h3 className="font-bold text-neutral-900 text-sm mb-3">QR code</h3>
        <div
          className="rounded-xl overflow-hidden border border-neutral-200 bg-white p-1"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="mt-3 text-xs text-neutral-400">
          Code: <span className="font-mono font-bold tracking-widest text-neutral-700">{code}</span>
        </div>
        <button
          onClick={downloadQr}
          className="mt-3 h-9 w-full rounded-lg bg-neutral-900 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
        >
          <Download size={13} /> QR download
        </button>
      </div>
    </div>
  );
}
