import { ShieldCheck, ShieldAlert } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { kycGaps } from "@/lib/partner-payouts";
import { ProfileForm, PayoutForm, KycForm } from "@/components/partner/ProfileForms";

export const metadata = { title: "Profile — Partner | PGSathi" };

const TYPE_LABEL: Record<string, string> = {
  FREELANCER: "Freelancer",
  CHANNEL_PARTNER: "Channel Partner",
  MARKETING_EXECUTIVE: "Marketing Executive",
  SALES_EXECUTIVE: "Sales Executive",
  SUB_BROKER: "Sub Broker",
};

export default async function PartnerProfilePage() {
  const ctx = await requirePartner();
  const profile = await db.partnerProfile.findUnique({
    where: { id: ctx.partnerId },
    select: {
      company: true, city: true, address: true, type: true, createdAt: true,
      panNumber: true, panImage: true, aadhaarNumber: true, aadhaarFrontImage: true, aadhaarBackImage: true, bankName: true, bankAccountNo: true, bankIfsc: true, upiId: true,
      kycVerifiedAt: true,
      user: { select: { name: true, phone: true, email: true } },
    },
  });
  if (!profile) return null;

  // A payout cannot be created until these are complete and an admin has signed
  // them off, so the partner should never discover that on payout day.
  const gaps = kycGaps(profile);
  const awaitingAdmin = gaps.length === 1 && gaps[0] === "admin verification";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {TYPE_LABEL[profile.type]} · Partner Code{" "}
          <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{ctx.partnerCode}</span>
        </p>
      </div>

      {/* ── Payout readiness ─────────────────────────────────── */}
      {gaps.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4">
          <ShieldCheck size={18} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-green-900 dark:text-green-400">Payout details verified</p>
            <p className="text-green-800 dark:text-green-500/90 text-xs mt-0.5">
              Approved earnings agle payout cycle me apne aap chali jayengi.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
          <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-amber-900 dark:text-amber-400">
              {awaitingAdmin ? "Admin verification ka intezaar" : "Payout details adhoore hain"}
            </p>
            <p className="text-amber-800 dark:text-amber-500/90 text-xs mt-0.5">
              {awaitingAdmin
                ? "Aapne details bhar di hain — admin verify karte hi payout ban sakega."
                : `Abhi baaki: ${gaps.filter((g) => g !== "admin verification").join(", ")}. Jab tak ye nahi bharenge, approved earnings hold rahengi.`}
            </p>
          </div>
        </div>
      )}

      {/* Read-only account facts */}
      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-neutral-500 dark:text-neutral-400 block text-xs">Phone</span><span className="font-semibold text-neutral-900 dark:text-white">{profile.user.phone ?? "—"}</span></div>
          <div><span className="text-neutral-500 dark:text-neutral-400 block text-xs">Email</span><span className="font-semibold text-neutral-900 dark:text-white truncate block">{profile.user.email}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Personal details</h2>
        <ProfileForm initial={{ name: profile.user.name, company: profile.company ?? "", city: profile.city ?? "", address: profile.address ?? "" }} />
      </div>

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Payout details</h2>
        <PayoutForm initial={{ panNumber: profile.panNumber ?? "", bankName: profile.bankName ?? "", bankAccountNo: profile.bankAccountNo ?? "", bankIfsc: profile.bankIfsc ?? "", upiId: profile.upiId ?? "" }} />
      </div>

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/60 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">KYC Documents</h2>
        <KycForm initial={{ aadhaarNumber: profile.aadhaarNumber ?? "", panImage: profile.panImage ?? null, aadhaarFrontImage: profile.aadhaarFrontImage ?? null, aadhaarBackImage: profile.aadhaarBackImage ?? null }} />
      </div>
    </div>
  );
}
