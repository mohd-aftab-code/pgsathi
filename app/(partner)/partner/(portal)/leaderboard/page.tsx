import { Trophy, TrendingUp } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { db } from "@/lib/db";
import { getLeaderboard } from "@/lib/partner-funnel";
import { getTierProgress } from "@/lib/partner-tier";

export const metadata = { title: "Leaderboard — Partner | PGSathi" };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function PartnerLeaderboardPage() {
  const ctx = await requirePartner();

  const profile = await db.partnerProfile.findUnique({
    where: { id: ctx.partnerId },
    select: { tierOverride: true },
  });

  const [board, tier] = await Promise.all([
    getLeaderboard({ forPartnerId: ctx.partnerId, take: 10 }),
    getTierProgress(ctx.partnerId, profile?.tierOverride),
  ]);

  const monthLabel = board.monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Leaderboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {monthLabel} — commission ke hisaab se, registrations ke nahi. Jo owner sach me paid hua, wahi ginta hai.
        </p>
      </div>

      {/* ── Your tier ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-white">Aapka tier</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {tier.bonusPercent > 0
                ? `${tier.label} partners ko har commission par ${tier.bonusPercent}% extra milta hai.`
                : "Tier badhne par har commission par extra bonus milta hai."}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
            tier.tier === "PLATINUM" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : tier.tier === "GOLD" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}>
            {tier.label}
          </span>
        </div>

        {tier.next ? (
          <>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-neutral-600 dark:text-neutral-400">
                {tier.next.needed > 0
                  ? `${tier.next.label} tak ${tier.next.needed} aur paid owner`
                  : `${tier.next.label} unlock ho gaya!`}
              </span>
              <span className="text-neutral-900 dark:text-white">
                {tier.conversions} paid owners
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                style={{ width: `${tier.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {tier.next.label} par har commission par {tier.next.bonusPercent}% extra milega.
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Aap top tier par hain — {tier.conversions} paid owners ke saath. 🏆
          </p>
        )}
      </section>

      {/* ── Top 10 ────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <Trophy size={16} className="text-amber-500" />
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">Is mahine ke top partners</h2>
        </div>

        {board.top.length === 0 ? (
          <div className="py-14 text-center">
            <p className="font-bold text-neutral-700 dark:text-neutral-300">Is mahine abhi koi earning nahi hui</p>
            <p className="text-sm text-neutral-400 mt-1">Pehla naam aapka ho sakta hai.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {board.top.map((row) => (
              <LeaderRow key={row.partnerId} row={row} />
            ))}
          </ul>
        )}

        {/* Outside the top 10 — still show where they stand. */}
        {board.you && board.you.rank > board.top.length && (
          <div className="border-t-2 border-dashed border-neutral-200 dark:border-neutral-700">
            <ul>
              <LeaderRow row={board.you} />
            </ul>
          </div>
        )}

        {!board.you && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 py-4 text-sm text-neutral-500 dark:text-neutral-400">
            Is mahine aapki koi earning nahi hui — ek paid conversion se aap list me aa jayenge.
          </div>
        )}
      </section>

      <p className="text-xs text-neutral-400 text-center">
        {board.total} partners is mahine active hain.
      </p>
    </div>
  );
}

function LeaderRow({ row }: { row: { rank: number; name: string; partnerCode: string; city: string | null; conversions: number; earned: number; isYou: boolean } }) {
  const medal = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : null;

  return (
    <li className={`flex items-center gap-3 px-5 py-3.5 ${row.isYou ? "bg-primary-50/60 dark:bg-primary-500/10" : ""}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0 ${
        medal ? "text-lg" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
      }`}>
        {medal ?? row.rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900 dark:text-white truncate">
            {/* Other partners are shown by code — earnings are nobody else's business. */}
            {row.isYou ? row.name : maskName(row.name)}
          </span>
          {row.isYou && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-primary-500 text-white">You</span>
          )}
        </div>
        <div className="text-[11px] text-neutral-400 tracking-widest">
          {row.partnerCode}{row.city ? ` · ${row.city}` : ""}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-extrabold text-neutral-900 dark:text-white">{inr(row.earned)}</div>
        <div className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
          <TrendingUp size={10} /> {row.conversions} earnings
        </div>
      </div>
    </li>
  );
}

/** "Rahul Sharma" → "Rahul S." — enough to feel like a person, not enough to identify. */
function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
