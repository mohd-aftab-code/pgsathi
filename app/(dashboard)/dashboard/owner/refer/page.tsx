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
    <div className="space-y-5 max-w-4xl">
      <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-violet-500 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} />
          <span className="text-xs font-bold uppercase tracking-widest opacity-90">Refer &amp; Earn</span>
        </div>
        <h1 className="text-2xl font-extrabold mb-1">Apne jaan-pehchan ke PG owners ko bulayein</h1>
        <p className="text-violet-100 text-sm max-w-2xl">
          {bonusDays > 0
            ? `Jo owner aapke link se join karke plan lega, use ${bonusDays} din extra free milenge — aur aapko bhi.`
            : "Jo owner aapke link se join karega, wo aapke naam ke saath judega."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <s.Icon size={16} className="text-violet-600 mb-2" />
            <div className="text-2xl font-extrabold text-neutral-900 leading-tight">{s.value}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>

      <OwnerReferralShare code={code} link={link} qrSvg={qr} bonusDays={bonusDays} />

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900 text-sm">Aapke laye owners ({referred.length})</h2>
        </div>
        {referred.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-400">
            Abhi koi nahi — link share karke shuruaat karein.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {referred.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="font-semibold text-neutral-900 text-sm">{r.name}</div>
                  <div className="text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  r.referralRewardAt ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
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
