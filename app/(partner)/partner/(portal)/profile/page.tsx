import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { ProfileForm, PayoutForm } from "@/components/partner/ProfileForms";

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
      panNumber: true, bankName: true, bankAccountNo: true, bankIfsc: true, upiId: true,
      user: { select: { name: true, phone: true, email: true } },
    },
  });
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {TYPE_LABEL[profile.type]} · Partner Code{" "}
          <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{ctx.partnerCode}</span>
        </p>
      </div>

      {/* Read-only account facts */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-neutral-500 dark:text-neutral-400 block text-xs">Phone</span><span className="font-semibold text-neutral-900 dark:text-white">{profile.user.phone ?? "—"}</span></div>
          <div><span className="text-neutral-500 dark:text-neutral-400 block text-xs">Email</span><span className="font-semibold text-neutral-900 dark:text-white truncate block">{profile.user.email}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Personal details</h2>
        <ProfileForm initial={{ name: profile.user.name, company: profile.company ?? "", city: profile.city ?? "", address: profile.address ?? "" }} />
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Payout details</h2>
        <PayoutForm initial={{ panNumber: profile.panNumber ?? "", bankName: profile.bankName ?? "", bankAccountNo: profile.bankAccountNo ?? "", bankIfsc: profile.bankIfsc ?? "", upiId: profile.upiId ?? "" }} />
      </div>
    </div>
  );
}
