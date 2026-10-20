import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, IndianRupee, Clock, Wallet, User, Phone, Mail, MapPin, Landmark, Activity, FileText, CheckCircle2, XCircle, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { AdminPartnerActions } from "@/components/dashboard/AdminPartnerActions";
import { AdminPartnerControls } from "@/components/dashboard/AdminPartnerControls";
import { AdminEarningActions } from "@/components/dashboard/AdminEarningActions";
import { CreatePayoutButton } from "@/components/dashboard/CreatePayoutButton";
import { PayoutRowActions } from "@/components/dashboard/PayoutActions";
import { kycGaps } from "@/lib/partner-payouts";
import { getTierProgress } from "@/lib/partner-tier";
import { PartnerTabs } from "@/components/dashboard/PartnerTabs";

export const metadata = { title: "Partner Detail — Admin | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TYPE_LABEL: Record<string, string> = {
  FREELANCER: "Freelancer", CHANNEL_PARTNER: "Channel Partner",
  MARKETING_EXECUTIVE: "Marketing Executive", SALES_EXECUTIVE: "Sales Executive", SUB_BROKER: "Sub Broker",
};
const statusStyle: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700", PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700", SUSPENDED: "bg-neutral-200 text-neutral-600",
  PAID: "bg-green-100 text-green-700", CANCELLED: "bg-neutral-200 text-neutral-500",
  ACTIVE: "bg-blue-100 text-blue-700", INACTIVE: "bg-neutral-200 text-neutral-500",
  PROCESSING: "bg-blue-100 text-blue-700", COMPLETED: "bg-green-100 text-green-700", FAILED: "bg-red-100 text-red-700",
};

export default async function AdminPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partnerId = parseInt(id);
  if (Number.isNaN(partnerId)) notFound();

  const partner = await db.partnerProfile.findUnique({
    where: { id: partnerId },
    include: {
      user: { 
        select: { 
          name: true, phone: true, email: true, createdAt: true,
          listings: {
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, status: true, createdAt: true, priceMin: true, city: { select: { name: true } } },
          }
        } 
      },
      listings: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true, priceMin: true, city: { select: { name: true } } },
      },
      earnings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, amount: true, status: true, createdAt: true, planNameSnapshot: true, payoutId: true,
          onHold: true, holdReason: true, kind: true, commissionRateSnapshot: true,
          owner: { select: { name: true } },
          listing: { select: { title: true } },
        },
      },
      payouts: { orderBy: { createdAt: "desc" }, select: { id: true, amount: true, method: true, reference: true, status: true, paidAt: true, createdAt: true } },
      activity: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, action: true, createdAt: true } },
    },
  });
  if (!partner) notFound();

  // What still blocks a payout, and what the tier is actually worth — both are
  // computed by the same helpers the payout pipeline and commission engine use,
  // so the page can never disagree with what the API will do.
  const gaps = kycGaps(partner);
  const kycMissingAdmin = gaps.filter((g) => g !== "admin verification");
  const kycAllFilled = kycMissingAdmin.length === 0;
  const tier = await getTierProgress(partner.id, partner.tierOverride);

  // Candidate parents for the sub-partner hierarchy. Self is excluded because a
  // partner cannot be their own parent, and archived partners are not offered.
  const parentOptions = (
    await db.partnerProfile.findMany({
      where: { id: { not: partner.id }, status: "APPROVED", archivedAt: null },
      orderBy: { partnerCode: "asc" },
      take: 100,
      select: { id: true, partnerCode: true, user: { select: { name: true } } },
    })
  ).map((p) => ({ id: p.id, label: `${p.user.name} (${p.partnerCode})` }));

  // ── Business summary: what this partner is actually generating ──────────
  // Commission follows the owner, so the owner list — not the PG list — is what
  // drives collection and what is owed.
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const owners = await db.user.findMany({
    where: { partnerId },
    select: {
      id: true,
      _count: { select: { listings: true } },
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIAL"] }, endDate: { gt: now } },
        orderBy: { endDate: "desc" },
        take: 1,
        select: { amount: true, endDate: true, plan: { select: { name: true, price: true } } },
      },
    },
  });
  const ownerIds = owners.map((o) => o.id);
  const paidOwners = owners.filter((o) => o.subscriptions[0] && o.subscriptions[0].plan.price > 0);
  const totalOwnerPgs = owners.reduce((t, o) => t + o._count.listings, 0);
  const renewingSoon = paidOwners.filter((o) => o.subscriptions[0]!.endDate <= in30Days).length;

  // Money actually collected from this partner's owners this month.
  const monthCollection = ownerIds.length
    ? (await db.invoice.aggregate({
        where: {
          subscription: { userId: { in: ownerIds } },
          status: "PAID",
          invoiceDate: { gte: monthStart },
        },
        _sum: { amount: true },
      }))._sum.amount ?? 0
    : 0;

  const sum = (s: string[]) => partner.earnings.filter((e) => s.includes(e.status)).reduce((t, e) => t + e.amount, 0);
  const pending = sum(["PENDING"]);
  const approved = sum(["APPROVED"]);
  const paid = sum(["PAID"]);
  // Everything not yet sent, regardless of approval stage — "kitna dena baaki hai".
  const owed = pending + approved;
  // Approved-but-unpaid earnings are what a payout batch would cover.
  const payable = partner.earnings.filter((e) => e.status === "APPROVED" && !e.payoutId);
  const payableTotal = payable.reduce((t, e) => t + e.amount, 0);

  const allListingsMap = new Map();
  partner.listings.forEach(l => allListingsMap.set(l.id, l));
  partner.user.listings.forEach(l => allListingsMap.set(l.id, l));
  const allListings = Array.from(allListingsMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const stats = [
    { label: "Registered PGs", value: String(allListings.length), Icon: Building2, cls: "text-blue-600 bg-blue-50" },
    { label: "Pending", value: inr(pending), Icon: Clock, cls: "text-amber-600 bg-amber-50" },
    { label: "Approved (unpaid)", value: inr(approved), Icon: IndianRupee, cls: "text-violet-600 bg-violet-50" },
    { label: "Paid out", value: inr(paid), Icon: Wallet, cls: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-5">
      <PartnerTabs />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 sm:p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-extrabold">{partner.user.name}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusStyle[partner.status]}`}>{partner.status}</span>
            </div>
            <p className="text-slate-300 text-xs">
              {TYPE_LABEL[partner.type] ?? partner.type} · <span className="tracking-widest font-bold">{partner.partnerCode}</span>
              {partner.city ? ` · ${partner.city}` : ""}
            </p>
          </div>
          <AdminPartnerActions id={partner.id} status={partner.status} />
        </div>
      </div>

      {/* ── Programme controls ─────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-bold text-slate-900 text-sm">Partner controls</h2>
          <span className="text-xs text-slate-500">
            Tier <b>{tier.label}</b>
            {tier.bonusPercent > 0 ? ` (+${tier.bonusPercent}% bonus)` : ""} · {tier.conversions} paid owners
          </span>
        </div>
        <AdminPartnerControls
          partnerId={partner.id}
          kycVerifiedAt={partner.kycVerifiedAt}
          kycGaps={gaps}
          riskFlagged={partner.riskFlagged}
          riskReason={partner.riskReason}
          commissionOverridePercent={partner.commissionOverridePercent}
          tierOverride={partner.tierOverride}
          parentPartnerId={partner.parentPartnerId}
          parentOverridePercent={partner.parentOverridePercent}
          archivedAt={partner.archivedAt}
          parentOptions={parentOptions}
        />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.cls}`}><s.Icon size={14} /></div>
            </div>
            <div className="text-xl font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Business summary — the whole money picture for this partner in one strip.
          Collection is what the owners actually paid; owed is commission not yet sent. */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm mb-4">Business summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Owners laaye", value: String(owners.length), sub: `${totalOwnerPgs} PG total` },
            { label: "Paid owners", value: String(paidOwners.length), sub: `${owners.length - paidOwners.length} free par` },
            { label: "Is mahine collection", value: inr(monthCollection), sub: "inke owners se" },
            { label: "Commission banta", value: inr(pending + approved + paid), sub: "lifetime" },
            { label: "Pay ho chuka", value: inr(paid), sub: `${partner.payouts.length} payout` },
            { label: "Dena baaki", value: inr(owed), sub: owed > 0 ? `${inr(approved)} approve ho chuka` : "sab clear" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[11px] text-slate-500 font-semibold">{s.label}</div>
              <div className="text-lg font-bold text-slate-900">{s.value}</div>
              <div className="text-[11px] text-slate-400 font-medium">{s.sub}</div>
            </div>
          ))}
        </div>
        {renewingSoon > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
            <b className="text-slate-900">{renewingSoon}</b> owner ka plan agle 30 din mein renew hoga — har renewal par is partner ka commission dobara banega.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Contact + payout details — what the admin needs before paying */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3">Contact</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium"><User size={14} className="text-slate-400" /> {partner.user.name}</div>
              <div className="flex items-center gap-2 text-slate-700 font-medium"><Phone size={14} className="text-slate-400" /> {partner.user.phone ?? "—"}</div>
              <div className="flex items-center gap-2 text-slate-700 font-medium break-all"><Mail size={14} className="text-slate-400 shrink-0" /> {partner.user.email}</div>
              {partner.address && <div className="flex items-start gap-2 text-slate-700 font-medium"><MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" /> {partner.address}</div>}
              {partner.company && <div className="text-xs text-slate-500 pt-1">Company: {partner.company}</div>}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Joined {fmtDate(partner.user.createdAt)}</div>
              {partner.approvedAt && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved {fmtDate(partner.approvedAt)}</div>}
              {partner.rejectReason && <div className="text-xs text-rose-600 pt-1">Reject reason: {partner.rejectReason}</div>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5"><Landmark size={15} className="text-slate-400" /> Payout details</h2>
            {partner.upiId || partner.bankAccountNo ? (
              <div className="space-y-2 text-xs">
                {partner.upiId && <div><span className="text-slate-400 text-[10px] uppercase font-bold block">UPI</span><span className="font-bold text-slate-900">{partner.upiId}</span></div>}
                {partner.bankName && <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Bank</span><span className="font-bold text-slate-900">{partner.bankName}</span></div>}
                {partner.bankAccountNo && <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Account</span><span className="font-bold text-slate-900">{partner.bankAccountNo}</span></div>}
                {partner.bankIfsc && <div><span className="text-slate-400 text-[10px] uppercase font-bold block">IFSC</span><span className="font-bold text-slate-900">{partner.bankIfsc}</span></div>}
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Partner ne abhi payout details nahi bhare. Payment se pehle unse bharwa lein.
              </p>
            )}
          </div>

          {/* ── KYC Documents — premium redesign ─────────────── */}
          <div className={`rounded-xl border p-5 shadow-xs ${
            partner.kycVerifiedAt
              ? "bg-emerald-50/70 border-emerald-200"
              : kycAllFilled
              ? "bg-blue-50/70 border-blue-200"
              : "bg-white border-slate-200/80"
          }`}>
            {/* Header row */}
            <div className="flex items-center gap-2 mb-4">
              {partner.kycVerifiedAt
                ? <ShieldCheck size={15} className="text-green-600 shrink-0" />
                : kycAllFilled
                ? <ShieldCheck size={15} className="text-blue-500 shrink-0" />
                : <ShieldAlert size={15} className="text-amber-500 shrink-0" />}
              <h2 className="font-bold text-neutral-900 text-sm">KYC Documents</h2>
              <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full ${
                partner.kycVerifiedAt
                  ? "bg-green-100 text-green-700"
                  : kycAllFilled
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {partner.kycVerifiedAt ? "✓ Verified" : kycAllFilled ? "Pending approval" : `${kycMissingAdmin.length} missing`}
              </span>
            </div>

            {/* Aadhaar + PAN number row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/80 rounded-xl border border-neutral-100 px-3 py-2.5">
                <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Aadhaar No.</span>
                <span className={`text-sm font-bold tracking-wider ${
                  partner.aadhaarNumber ? "text-neutral-900" : "text-neutral-300"
                }`}>{partner.aadhaarNumber || "Not filled"}</span>
              </div>
              <div className="bg-white/80 rounded-xl border border-neutral-100 px-3 py-2.5">
                <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">PAN No.</span>
                <span className={`text-sm font-bold tracking-wider ${
                  partner.panNumber ? "text-neutral-900" : "text-neutral-300"
                }`}>{partner.panNumber || "Not filled"}</span>
              </div>
            </div>

            {/* Document thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "PAN Card", url: partner.panImage },
                { label: "Aadhaar Front", url: partner.aadhaarFrontImage },
                { label: "Aadhaar Back", url: partner.aadhaarBackImage },
              ].map((doc) => (
                <div key={doc.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-500 text-[10px] font-semibold">{doc.label}</span>
                    {doc.url
                      ? <CheckCircle2 size={10} className="text-green-500" />
                      : <XCircle size={10} className="text-red-400" />}
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block w-full h-24 rounded-xl border-2 border-neutral-200 overflow-hidden hover:border-primary-400 transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-24 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1">
                      <FileText size={16} className="text-neutral-300" />
                      <span className="text-[10px] text-neutral-400 font-medium">Not uploaded</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Verified timestamp or missing note */}
            {partner.kycVerifiedAt ? (
              <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-1.5 text-[11px] text-green-700 font-semibold">
                <CheckCircle2 size={12} />
                Verified on {fmtDate(partner.kycVerifiedAt)}
              </div>
            ) : !kycAllFilled ? (
              <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] text-amber-700 font-medium">
                Missing: {kycMissingAdmin.join(" · ")}
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-blue-100 text-[11px] text-blue-700 font-medium">
                All documents submitted — verify karein upar Partner controls mein.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5"><Activity size={15} className="text-slate-400" /> Recent activity</h2>
            {partner.activity.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Koi activity nahi</p>
            ) : (
              <ul className="space-y-2.5">
                {partner.activity.map((a) => (
                  <li key={a.id} className="flex gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-700 font-medium">{a.action}</p>
                      <p className="text-slate-400 text-[10px]">{fmtDate(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* PGs + earnings + payouts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Payout batch */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Payout</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {payable.length > 0
                    ? `${payable.length} approved earning(s) ready — total ${inr(payableTotal)}`
                    : "Koi approved earning payout ke liye pending nahi"}
                </p>
              </div>
              <CreatePayoutButton
                partnerId={partner.id}
                count={payable.length}
                amount={payableTotal}
                hasPayoutDetails={!!(partner.upiId || partner.bankAccountNo)}
                kycGaps={gaps}
              />
            </div>

            {partner.payouts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {partner.payouts.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{inr(p.amount)}</span>
                      <span className="text-slate-500">{p.method}{p.reference ? ` · ${p.reference}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fmtDate(p.paidAt ?? p.createdAt)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusStyle[p.status]}`}>{p.status}</span>
                      {/* PROCESSING → record the UTR; COMPLETED → reverse if the
                          transfer bounced. Editing the earnings is never the answer. */}
                      <PayoutRowActions payoutId={p.id} status={p.status} amount={p.amount} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200/80">
              <h2 className="font-bold text-slate-900 text-sm">Earnings ({partner.earnings.length})</h2>
            </div>
            {partner.earnings.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-slate-500">Abhi koi earning nahi</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-200/80">
                      <th className="px-5 py-2.5 font-bold">Owner</th>
                      <th className="px-3 py-2.5 font-bold">Plan</th>
                      <th className="px-3 py-2.5 font-bold">Date</th>
                      <th className="px-3 py-2.5 font-bold text-right">Amount</th>
                      <th className="px-3 py-2.5 font-bold">Status</th>
                      <th className="px-5 py-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partner.earnings.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-2.5 max-w-[180px] truncate font-medium text-slate-800">{e.owner?.name ?? e.listing?.title ?? "—"}</td>
                        <td className="px-3 py-2.5 text-slate-600">{e.planNameSnapshot ?? "—"}</td>
                        <td className="px-3 py-2.5 text-slate-500">{fmtDate(e.createdAt)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-900">{inr(e.amount)}</td>
                        <td className="px-3 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusStyle[e.status]}`}>{e.status}</span></td>
                        <td className="px-5 py-2.5"><AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PGs */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200/80">
              <h2 className="font-bold text-slate-900 text-sm">Registered PGs ({allListings.length})</h2>
            </div>
            {allListings.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-slate-500">Abhi koi PG register nahi kiya</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {allListings.map((l) => (
                  <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate text-xs">{l.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{l.city?.name ?? "—"} · ₹{l.priceMin} · {fmtDate(l.createdAt)}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${statusStyle[l.status] ?? statusStyle.INACTIVE}`}>{l.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
