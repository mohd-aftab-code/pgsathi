import { redirect } from "next/navigation";
import { Gift, MousePointerClick, Users, BadgeCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateOwnerReferralCode } from "@/lib/referral";
import { qrSvg } from "@/lib/qr";
import { OwnerReferralShare } from "@/components/dashboard/OwnerReferralShare";

export const metadata = { title: "Refer & Earn — Owner | PGSathi" };

/**
 * Owner-to-owner referral.
 *
 * Owners already trust the product and their network is exactly the target
 * market, which makes this the cheapest acquisition channel available — and it
 * needed no new tables, because `User.referralCode` / `User.referredBy` had been
 * sitting unused in the schema since the start.
 */
export default async function OwnerReferPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = parseInt(session.user.id, 10);
  if (Number.isNaN(userId)) redirect("/login");

  const code = await getOrCreateOwnerReferralCode(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in";
  const link = `${appUrl}/r/${code}`;

  const [clicks, referred, bonusPlan] = await Promise.all([
    db.referralClick.count({ where: { code } }),
    db.user.findMany({
      where: { referredBy: userId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, name: true, createdAt: true, referralRewardAt: true },
    }),
    db.plan.findFirst({
      where: { isActive: true, referralBonusDays: { gt: 0 } },
      orderBy: { referralBonusDays: "desc" },
      select: { referralBonusDays: true },
    }),
  ]);

  const bonusDays = bonusPlan?.referralBonusDays ?? 0;
  const converted = referred.filter((r) => r.referralRewardAt !== null).length;
  const qr = qrSvg(link, { size: 170, dark: "#171717" });

  const stats = [
    { label: "Link clicks", value: clicks, Icon: MousePointerClick },
    { label: "Join kiye", value: referred.length, Icon: Users },
    { label: "Paid hue", value: converted, Icon: BadgeCheck },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 p-5 sm:p-6 text-white shadow-sm border border-violet-400/50">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Refer &amp; Earn</span>
        </div>
        <h1 className="text-xl font-black mb-1 tracking-tight">Apne jaan-pehchan ke PG owners ko bulayein</h1>
        <p className="text-violet-100 text-xs font-medium max-w-2xl mt-1.5">
          {bonusDays > 0
            ? `Jo owner aapke link se join karke plan lega, use ${bonusDays} din extra free milenge — aur aapko bhi.`
            : "Jo owner aapke link se join karega, wo aapke naam ke saath judega."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200/60 bg-white/60 backdrop-blur-md p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <s.Icon size={20} className="text-violet-600 mb-2" />
            <div className="text-2xl font-black text-neutral-900 leading-none mb-1.5">{s.value}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      <OwnerReferralShare code={code} link={link} qrSvg={qr} bonusDays={bonusDays} />

      <section className="rounded-2xl border border-neutral-200/60 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100/60 bg-white/40">
          <h2 className="font-black text-neutral-900 text-sm uppercase tracking-wider">Aapke laye owners ({referred.length})</h2>
        </div>
        {referred.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs font-medium text-neutral-500 bg-white/20">
            Abhi koi nahi — link share karke shuruaat karein.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100/60">
            {referred.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/40 transition-colors">
                <div>
                  <div className="font-bold text-neutral-900 text-[13px]">{r.name}</div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm ${
                  r.referralRewardAt ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                }`}>
                  {r.referralRewardAt ? "PAID PLAN" : "JOINED"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
