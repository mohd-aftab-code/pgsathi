"use client";

import { useMemo, useState } from "react";
import {
  Copy, CheckCircle2, MessageCircle, Link as LinkIcon, Download,
  QrCode, TrendingUp, Users, BadgeCheck, MousePointerClick,
} from "lucide-react";

export type FunnelData = {
  clicks: number;
  signups: number;
  paidOwners: number;
  clickToSignup: number;
  signupToPaid: number;
  earned: number;
};

/**
 * Message templates a partner can send as-is.
 *
 * Every partner used to write their own pitch, and most wrote a bad one — the
 * link with "join this" attached. These are the same three conversations that
 * actually happen, in the language they happen in.
 */
const TEMPLATES = [
  {
    id: "owner-hi",
    label: "Single PG owner (Hindi)",
    audience: "Jinke 1–2 PG hain",
    body: (link: string) =>
      `Namaste 🙏\n\nMain PGSathi se hoon — PG owners ke liye ek zero-brokerage platform hai. Aapka PG online list hoga, tenants seedha aapko contact karenge, aur rent/tenant manage karne ke liye free CRM bhi milta hai.\n\nKoi brokerage nahi, koi commission nahi.\n\nYahan se register kar lijiye (2 minute lagenge):\n${link}\n\nKoi doubt ho toh call kar lijiye.`,
  },
  {
    id: "owner-en",
    label: "Single PG owner (English)",
    audience: "For English-first owners",
    body: (link: string) =>
      `Hello 👋\n\nI'm reaching out from PGSathi — a zero-brokerage platform for PG owners. You get your PG listed online, tenants contact you directly, and a free CRM to manage rent, tenants and complaints.\n\nNo brokerage. No commission on your rent.\n\nRegister here (takes 2 minutes):\n${link}\n\nHappy to walk you through it on a call.`,
  },
  {
    id: "chain",
    label: "Hostel / PG chain",
    audience: "5+ properties",
    body: (link: string) =>
      `Namaste 🙏\n\nAapke jitne PG/hostel hain, unn sabko ek hi dashboard se manage kar sakte hain — tenants, rent collection, complaints, staff, expenses, sab ek jagah. Saath me har property ki listing bhi live rahegi.\n\nMulti-property owners ke liye ye sabse zyada kaam ka hai.\n\nDetails aur registration:\n${link}\n\nDemo dikha doon?`,
  },
  {
    id: "followup",
    label: "Follow-up nudge",
    audience: "Jinhone abhi tak register nahi kiya",
    body: (link: string) =>
      `Namaste 🙏\n\nPichli baar PGSathi ke baare me baat hui thi. Registration abhi bhi free hai aur 2 minute ka kaam hai — link yahan hai:\n${link}\n\nAgar koi sawaal ho toh bata dijiye, main help kar dunga.`,
  },
] as const;

export function MarketingView({
  partnerCode,
  appUrl,
  qrSvg,
  funnel,
  bonusDays,
}: {
  partnerCode: string;
  appUrl: string;
  /** Pre-rendered server-side — the encoder is Node-only. */
  qrSvg: string;
  funnel: FunnelData;
  /** Extra free days the referred owner gets, 0 when no plan offers any. */
  bonusDays: number;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>(TEMPLATES[0].id);

  // The short link is what goes on posters and into WhatsApp; it also records
  // the click, which the long ?ref= form cannot do.
  const shortLink = `${appUrl}/r/${partnerCode}`;
  const template = TEMPLATES.find((t) => t.id === activeTemplate) ?? TEMPLATES[0];
  const message = useMemo(() => template.body(shortLink), [template, shortLink]);

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
    a.download = `pgsathi-qr-${partnerCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPoster = () => {
    const blob = new Blob([posterSvg({ qrSvg, partnerCode, shortLink, bonusDays })], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pgsathi-poster-${partnerCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Funnel ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FunnelCard label="Link clicks" value={funnel.clicks} Icon={MousePointerClick} tone="slate" />
        <FunnelCard
          label="Signups"
          value={funnel.signups}
          sub={funnel.clicks > 0 ? `${funnel.clickToSignup}% of clicks` : "abhi koi click nahi"}
          Icon={Users}
          tone="violet"
        />
        <FunnelCard
          label="Paid owners"
          value={funnel.paidOwners}
          sub={funnel.signups > 0 ? `${funnel.signupToPaid}% convert hue` : "—"}
          Icon={BadgeCheck}
          tone="green"
        />
        <FunnelCard
          label="Earned"
          value={`₹${funnel.earned.toLocaleString("en-IN")}`}
          Icon={TrendingUp}
          tone="amber"
        />
      </div>

      {/* ── Link + QR ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900 dark:text-white text-lg mb-1">Aapka referral link</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
            Is link se register hone wale owner apne aap aapke &quot;Mere Owners&quot; me aa jaate hain.
            Link 30 din tak yaad rehta hai — owner aaj kholkar agle hafte register kare, tab bhi credit aapko hi milega.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <LinkIcon size={16} className="absolute inset-y-0 left-3.5 my-auto h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                readOnly
                value={shortLink}
                className="w-full h-11 pl-10 pr-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 outline-none"
              />
            </div>
            <button
              onClick={() => copy(shortLink, "link")}
              className="h-11 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 shrink-0"
            >
              {copied === "link" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied === "link" ? "Copied!" : "Copy Link"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400">Aapka code:</span>
            <button
              onClick={() => copy(partnerCode, "code")}
              className="font-mono font-bold tracking-widest text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              {copied === "code" ? "Copied!" : partnerCode}
            </button>
            {bonusDays > 0 && (
              <span className="ml-auto rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 px-2.5 py-1 font-bold">
                Owner ko {bonusDays} din extra free milenge
              </span>
            )}
          </div>
        </div>

        {/* QR */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-3">
            <QrCode size={20} />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">QR code</h3>
          <div
            className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white p-1"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="text-[11px] text-neutral-400 mt-3 mb-3">
            Visiting card, poster ya PG ke bahar chipka dijiye — scan karte hi link khul jayega.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={downloadQr}
              className="flex-1 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              QR
            </button>
            <button
              onClick={downloadPoster}
              className="flex-1 h-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Download size={13} /> Poster
            </button>
          </div>
        </div>
      </div>

      {/* ── Message templates ──────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-lg mb-1">Ready-made messages</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Apna link already inme laga hua hai. Copy karke seedha bhej dijiye.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                activeTemplate === t.id
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">{template.audience}</p>
        <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 font-sans leading-relaxed">
          {message}
        </pre>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={() => copy(message, "msg")}
            className="h-10 px-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            {copied === "msg" ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied === "msg" ? "Copied!" : "Message copy karein"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={15} /> WhatsApp par bhejein
          </a>
        </div>
      </div>
    </div>
  );
}

function FunnelCard({
  label, value, sub, Icon, tone,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: React.ComponentType<{ size?: number }>;
  tone: "slate" | "violet" | "green" | "amber";
}) {
  const tones = {
    slate: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300",
    violet: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    green: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon size={17} />
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/**
 * A print-ready A4 poster with the partner's QR on it, built as SVG so it needs
 * no image pipeline and stays sharp at any print size.
 */
function posterSvg({
  qrSvg, partnerCode, shortLink, bonusDays,
}: {
  qrSvg: string;
  partnerCode: string;
  shortLink: string;
  bonusDays: number;
}): string {
  // The QR is produced as a standalone <svg>; nest it so the poster keeps one
  // coordinate system.
  const qrInner = qrSvg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "");
  const qrViewBox = qrSvg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 33 33";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
  <rect width="595" height="842" fill="#ffffff"/>
  <rect width="595" height="250" fill="#6d28d9"/>
  <text x="297" y="88" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" fill="#ddd6fe" letter-spacing="4">ZERO BROKERAGE</text>
  <text x="297" y="150" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="48" font-weight="800" fill="#ffffff">Apna PG online</text>
  <text x="297" y="200" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="48" font-weight="800" fill="#ffffff">list karein — free</text>

  <text x="297" y="305" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#404040">Tenants seedha aapko contact karenge.</text>
  <text x="297" y="337" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#404040">Rent, tenants aur complaints ke liye free CRM.</text>
  ${bonusDays > 0
    ? `<text x="297" y="373" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" fill="#15803d">Is QR se register karein — ${bonusDays} din extra free</text>`
    : ""}

  <rect x="177" y="405" width="241" height="241" rx="16" fill="#ffffff" stroke="#e5e5e5" stroke-width="2"/>
  <svg x="185" y="413" width="225" height="225" viewBox="${qrViewBox}">${qrInner}</svg>

  <text x="297" y="692" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#171717">Scan karein ya visit karein</text>
  <text x="297" y="724" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="800" fill="#6d28d9">${shortLink}</text>

  <rect x="0" y="770" width="595" height="72" fill="#f5f3ff"/>
  <text x="297" y="800" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#6b7280">Referral code</text>
  <text x="297" y="826" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="800" fill="#4c1d95" letter-spacing="3">${partnerCode}</text>
</svg>`;
}
