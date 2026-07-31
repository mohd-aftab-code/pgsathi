import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, IndianRupee, Clock, Wallet, User, Phone, Mail, MapPin, Landmark, Activity } from "lucide-react";
import { db } from "@/lib/db";
import { AdminPartnerActions } from "@/components/dashboard/AdminPartnerActions";
import { AdminPartnerControls } from "@/components/dashboard/AdminPartnerControls";
import { AdminEarningActions } from "@/components/dashboard/AdminEarningActions";
import { CreatePayoutButton } from "@/components/dashboard/CreatePayoutButton";
import { PayoutRowActions } from "@/components/dashboard/PayoutActions";
import { kycGaps } from "@/lib/partner-payouts";
import { getTierProgress } from "@/lib/partner-tier";

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
      user: { select: { name: true, phone: true, email: true, createdAt: true } },
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

  const stats = [
    { label: "Registered PGs", value: String(partner.listings.length), Icon: Building2, cls: "text-blue-600 bg-blue-50" },
    { label: "Pending", value: inr(pending), Icon: Clock, cls: "text-amber-600 bg-amber-50" },
    { label: "Approved (unpaid)", value: inr(approved), Icon: IndianRupee, cls: "text-violet-600 bg-violet-50" },
    { label: "Paid out", value: inr(paid), Icon: Wallet, cls: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-5">
      <Link href="/dashboard/admin/partners" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
        <ArrowLeft size={16} /> All Partners
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold">{partner.user.name}</h1>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${statusStyle[partner.status]}`}>{partner.status}</span>
            </div>
            <p className="text-neutral-300 text-sm">
              {TYPE_LABEL[partner.type] ?? partner.type} · <span className="tracking-widest font-bold">{partner.partnerCode}</span>
              {partner.city ? ` · ${partner.city}` : ""}
            </p>
          </div>
          <AdminPartnerActions id={partner.id} status={partner.status} />
        </div>
      </div>

      {/* ── Programme controls ─────────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-bold text-neutral-900 text-sm">Partner controls</h2>
          <span className="text-xs text-neutral-500">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-neutral-500">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.cls}`}><s.Icon size={14} /></div>
            </div>
            <div className="text-xl font-bold text-neutral-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Business summary — the whole money picture for this partner in one strip.
          Collection is what the owners actually paid; owed is commission not yet sent. */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="font-bold text-neutral-900 text-sm mb-4">Business summary</h2>
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
              <div className="text-[11px] text-neutral-500">{s.label}</div>
              <div className="text-lg font-extrabold text-neutral-900">{s.value}</div>
              <div className="text-[11px] text-neutral-400">{s.sub}</div>
            </div>
          ))}
        </div>
        {renewingSoon > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100 text-sm text-neutral-600">
            <b className="text-neutral-900">{renewingSoon}</b> owner ka plan agle 30 din mein renew hoga — har renewal par is partner ka commission dobara banega.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Contact + payout details — what the admin needs before paying */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-bold text-neutral-900 text-sm mb-3">Contact</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-700"><User size={14} className="text-neutral-400" /> {partner.user.name}</div>
              <div className="flex items-center gap-2 text-neutral-700"><Phone size={14} className="text-neutral-400" /> {partner.user.phone ?? "—"}</div>
              <div className="flex items-center gap-2 text-neutral-700 break-all"><Mail size={14} className="text-neutral-400 shrink-0" /> {partner.user.email}</div>
              {partner.address && <div className="flex items-start gap-2 text-neutral-700"><MapPin size={14} className="text-neutral-400 shrink-0 mt-0.5" /> {partner.address}</div>}
              {partner.company && <div className="text-xs text-neutral-500 pt-1">Company: {partner.company}</div>}
              <div className="text-xs text-neutral-400 pt-1">Joined {fmtDate(partner.user.createdAt)}</div>
              {partner.approvedAt && <div className="text-xs text-neutral-400">Approved {fmtDate(partner.approvedAt)}</div>}
              {partner.rejectReason && <div className="text-xs text-red-600 pt-1">Reject reason: {partner.rejectReason}</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-bold text-neutral-900 text-sm mb-3 flex items-center gap-1.5"><Landmark size={15} className="text-neutral-400" /> Payout details</h2>
            {partner.upiId || partner.bankAccountNo ? (
              <div className="space-y-2 text-sm">
                {partner.upiId && <div><span className="text-neutral-500 text-xs block">UPI</span><span className="font-semibold text-neutral-900">{partner.upiId}</span></div>}
                {partner.bankName && <div><span className="text-neutral-500 text-xs block">Bank</span><span className="font-semibold text-neutral-900">{partner.bankName}</span></div>}
                {partner.bankAccountNo && <div><span className="text-neutral-500 text-xs block">Account</span><span className="font-semibold text-neutral-900">{partner.bankAccountNo}</span></div>}
                {partner.bankIfsc && <div><span className="text-neutral-500 text-xs block">IFSC</span><span className="font-semibold text-neutral-900">{partner.bankIfsc}</span></div>}
                {partner.panNumber && <div><span className="text-neutral-500 text-xs block">PAN</span><span className="font-semibold text-neutral-900">{partner.panNumber}</span></div>}
              </div>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Partner ne abhi payout details nahi bhare. Payment se pehle unse bharwa lein.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-bold text-neutral-900 text-sm mb-3 flex items-center gap-1.5"><Activity size={15} className="text-neutral-400" /> Recent activity</h2>
            {partner.activity.length === 0 ? (
              <p className="text-xs text-neutral-400">Koi activity nahi</p>
            ) : (
              <ul className="space-y-2.5">
                {partner.activity.map((a) => (
                  <li key={a.id} className="flex gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-neutral-700">{a.action}</p>
                      <p className="text-neutral-400">{fmtDate(a.createdAt)}</p>
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
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-neutral-900 text-sm">Payout</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
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
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                {partner.payouts.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{inr(p.amount)}</span>
                      <span className="text-xs text-neutral-500">{p.method}{p.reference ? ` · ${p.reference}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{fmtDate(p.paidAt ?? p.createdAt)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusStyle[p.status]}`}>{p.status}</span>
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
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900 text-sm">Earnings ({partner.earnings.length})</h2>
            </div>
            {partner.earnings.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">Abhi koi earning nahi</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 bg-neutral-50">
                      <th className="px-5 py-2.5 font-bold">Owner</th>
                      <th className="px-3 py-2.5 font-bold">Plan</th>
                      <th className="px-3 py-2.5 font-bold">Date</th>
                      <th className="px-3 py-2.5 font-bold text-right">Amount</th>
                      <th className="px-3 py-2.5 font-bold">Status</th>
                      <th className="px-5 py-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {partner.earnings.map((e) => (
                      <tr key={e.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-2.5 max-w-[180px] truncate text-neutral-800">{e.owner?.name ?? e.listing?.title ?? "—"}</td>
                        <td className="px-3 py-2.5 text-neutral-600">{e.planNameSnapshot ?? "—"}</td>
                        <td className="px-3 py-2.5 text-neutral-500">{fmtDate(e.createdAt)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-neutral-900">{inr(e.amount)}</td>
                        <td className="px-3 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusStyle[e.status]}`}>{e.status}</span></td>
                        <td className="px-5 py-2.5"><AdminEarningActions id={e.id} amount={e.amount} status={e.status} onHold={e.onHold} holdReason={e.holdReason} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PGs */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900 text-sm">Registered PGs ({partner.listings.length})</h2>
            </div>
            {partner.listings.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">Abhi koi PG register nahi kiya</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {partner.listings.map((l) => (
                  <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50">
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 truncate">{l.title}</div>
                      <div className="text-xs text-neutral-500">{l.city?.name ?? "—"} · ₹{l.priceMin} · {fmtDate(l.createdAt)}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${statusStyle[l.status] ?? statusStyle.INACTIVE}`}>{l.status}</span>
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
