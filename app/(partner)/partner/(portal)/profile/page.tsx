import { ShieldCheck, ShieldAlert, CheckCircle2, Circle, Clock, Fingerprint, Wallet } from "lucide-react";
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
      panNumber: true, panImage: true, aadhaarNumber: true, aadhaarFrontImage: true, aadhaarBackImage: true,
      bankName: true, bankAccountNo: true, bankIfsc: true, upiId: true,
      kycVerifiedAt: true,
      user: { select: { name: true, phone: true, email: true } },
    },
  });
  if (!profile) return null;

  const gaps = kycGaps(profile);
  const awaitingAdmin = gaps.length === 1 && gaps[0] === "admin verification";
  const kycMissing = gaps.filter((g) => g !== "admin verification");
  const isVerified = !!profile.kycVerifiedAt;
  const hasPaymentMethod = !!(profile.upiId || (profile.bankName && profile.bankAccountNo && profile.bankIfsc));

  const steps = [
    {
      id: "payout",
      label: "Payout Details",
      desc: "PAN number, UPI ID ya bank details",
      done: !!(profile.panNumber && hasPaymentMethod),
      pending: false,
      items: [
        { label: "PAN Number", done: !!profile.panNumber },
        { label: "UPI ID ya Bank", done: hasPaymentMethod },
      ],
    },
    {
      id: "kyc",
      label: "KYC Documents",
      desc: "Aadhaar aur PAN card images",
      done: !!(profile.aadhaarNumber && profile.panImage && profile.aadhaarFrontImage && profile.aadhaarBackImage),
      pending: false,
      items: [
        { label: "Aadhaar No.", done: !!profile.aadhaarNumber },
        { label: "PAN Image", done: !!profile.panImage },
        { label: "Aadhaar Front", done: !!profile.aadhaarFrontImage },
        { label: "Aadhaar Back", done: !!profile.aadhaarBackImage },
      ],
    },
    {
      id: "admin",
      label: "Admin Verification",
      desc: "Admin documents review karenge",
      done: isVerified,
      pending: awaitingAdmin && !isVerified,
      items: [{ label: "Admin approval", done: isVerified }],
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {TYPE_LABEL[profile.type]} {"\u00b7"} Partner Code{" "}
          <span className="font-bold tracking-widest text-primary-600 dark:text-primary-400">{ctx.partnerCode}</span>
        </p>
      </div>

      {isVerified ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-8 -bottom-4 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">KYC Verified {"\u2713"}</p>
              <p className="text-green-100 text-xs mt-1">
                Admin ne verify kiya {"\u2014"}{" "}
                {new Date(profile.kycVerifiedAt!).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.
                Payout ready hai!
              </p>
            </div>
          </div>
        </div>
      ) : awaitingAdmin ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">Documents Submitted! {"\u2713"}</p>
              <p className="text-blue-100 text-xs mt-1">
                Aapne sabhi details bhar di hain. Admin verification pending {"\u2014"} jaldi approve ho jayega.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">KYC Incomplete</p>
              <p className="text-amber-100 text-xs mt-1">
                {kycMissing.length} step{kycMissing.length > 1 ? "s" : ""} baaki hain neeche fill karein.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">KYC Progress</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            progressPct === 100
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : progressPct >= 66
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          }`}>{doneCount}/{steps.length} complete</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              progressPct === 100 ? "bg-green-500" : progressPct >= 66 ? "bg-blue-500" : "bg-amber-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl p-3.5 border ${
                step.done
                  ? "bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : step.pending
                  ? "bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                  : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                step.done ? "bg-green-500 text-white"
                : step.pending ? "bg-blue-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              }`}>
                {step.done ? <CheckCircle2 size={16} /> : step.pending ? <Clock size={14} /> : <span>{idx + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${
                  step.done ? "text-green-800 dark:text-green-300"
                  : step.pending ? "text-blue-800 dark:text-blue-300"
                  : "text-neutral-700 dark:text-neutral-200"
                }`}>{step.label}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{step.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.items.map((item) => (
                    <span key={item.label} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.done
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                    }`}>
                      {item.done ? <CheckCircle2 size={9} /> : <Circle size={9} />}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs">Phone</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{profile.user.phone ?? "—"}</span>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 block text-xs">Email</span>
            <span className="font-semibold text-neutral-900 dark:text-white truncate block">{profile.user.email}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/70 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm">
        <h2 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Personal Details</h2>
        <ProfileForm initial={{ name: profile.user.name, company: profile.company ?? "", city: profile.city ?? "", address: profile.address ?? "" }} />
      </div>

      <div className={`rounded-2xl border bg-white/70 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm ${
        profile.panNumber && hasPaymentMethod ? "border-green-200 dark:border-green-900" : "border-neutral-200/60 dark:border-neutral-800"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={15} className={profile.panNumber && hasPaymentMethod ? "text-green-500" : "text-primary-500"} />
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">Payout Details</h2>
          {profile.panNumber && hasPaymentMethod ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} /> Complete
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Circle size={9} /> Incomplete
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4">
          PAN number + UPI ID ya bank details bharen {"\u2014"} yahi payout ke liye use hoga.
        </p>
        <PayoutForm initial={{ panNumber: profile.panNumber ?? "", bankName: profile.bankName ?? "", bankAccountNo: profile.bankAccountNo ?? "", bankIfsc: profile.bankIfsc ?? "", upiId: profile.upiId ?? "" }} />
      </div>

      <div className={`rounded-2xl border bg-white/70 backdrop-blur-md dark:bg-neutral-900 p-5 shadow-sm ${
        profile.aadhaarNumber && profile.panImage && profile.aadhaarFrontImage && profile.aadhaarBackImage
          ? "border-green-200 dark:border-green-900" : "border-neutral-200/60 dark:border-neutral-800"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Fingerprint size={15} className={
            profile.aadhaarNumber && profile.panImage && profile.aadhaarFrontImage && profile.aadhaarBackImage
              ? "text-green-500" : "text-primary-500"
          } />
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">KYC Documents</h2>
          {profile.aadhaarNumber && profile.panImage && profile.aadhaarFrontImage && profile.aadhaarBackImage ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} /> Submitted
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Circle size={9} /> Pending
            </span>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4">
          Aadhaar number bharen aur PAN card + Aadhaar ki clear photos upload karein.
        </p>
        <KycForm initial={{ aadhaarNumber: profile.aadhaarNumber ?? "", panImage: profile.panImage ?? null, aadhaarFrontImage: profile.aadhaarFrontImage ?? null, aadhaarBackImage: profile.aadhaarBackImage ?? null }} />
      </div>
    </div>
  );
}
