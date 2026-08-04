import Link from "next/link";
import Image from "next/image";
import logoImg from "@/app/assets/logo/logo.png";

interface Stat {
  value: string;
  label: string;
}

/**
 * The dark half of the auth screens.
 *
 * It used to be the layout every login page defaults to: a flat brand colour, a
 * 5%-opacity grid overlay, and three oversized stat numbers stacked down the
 * side. Nothing in it said what the product was — swap the logo and it could
 * belong to any SaaS.
 *
 * This is a PG facade at night instead: floors of windows, a few of them lit.
 * It is the literal subject of the business, it puts warmth against a brand
 * palette that is entirely cool, and it is drawn in CSS, so it costs no image.
 *
 * The lit pattern is hardcoded and never random — a random layout would differ
 * between the server and client renders and trip a hydration mismatch.
 */

/**
 * `#` lit · `:` curtained · `.` dark. One string per floor, top floor first.
 *
 * 18 columns rather than 11: at 11 the windows came out wider than they were
 * tall and read as letterbox slots. Windows are roughly square in real life and
 * that is what makes the block legible as a building at a glance.
 */
const FACADE = [
  "..#....:.....#....",
  ":....#.....:....#.",
  "#...:....#......:.",
  "...#......:...#...",
  ".:....#......:...#",
  "..#......:..#.....",
  "#....:......#...:.",
  "...:...#.....:....",
  ".#......:...#....:",
  "....#......:.....#",
  ":...:..#......#...",
  "#......:...:....#.",
  "..:.#......#....:.",
];

/** Slow, staggered breathing, so the lights read as inhabited rather than decorative. */
function windowStyle(row: number, col: number, kind: string) {
  if (kind === ".") return undefined;
  // Deterministic — identical on the server and in the browser.
  const seed = (row * 7 + col * 13) % 11;
  return {
    animationDuration: `${6 + (seed % 5)}s`,
    animationDelay: `${(seed % 7) * 0.9}s`,
  };
}

/**
 * The building stands along the BOTTOM edge; all the copy lives above it.
 *
 * Two earlier attempts put the facade behind the text. Both failed the same way:
 * the scrim needed to keep the copy readable also drained the amber out of the
 * lit windows, so it read as a muddy heatmap instead of a building. Giving each
 * one its own space means the windows can stay at full strength and the type
 * needs no scrim at all.
 *
 * Only the roofline is faded, so the block emerges out of the night rather than
 * being pasted onto it.
 */
function Facade() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] overflow-hidden">
      <div className="flex h-full flex-col justify-end gap-[5px] px-9">
        {FACADE.map((floor, row) => (
          <div key={row} className="flex gap-[5px]">
            {floor.split("").map((kind, col) => (
              <span
                key={col}
                style={windowStyle(row, col, kind)}
                className={
                  "h-[19px] flex-1 rounded-[1.5px] " +
                  (kind === "#"
                    ? "animate-pulse bg-amber-300 shadow-[0_0_24px_1px_rgba(252,211,77,0.5)]"
                    : kind === ":"
                      ? "animate-pulse bg-amber-200/35"
                      : "bg-white/[0.055]")
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#1b0a42] to-transparent" />
    </div>
  );
}

export default function AuthBrandPanel({
  eyebrow,
  headline,
  accentWord,
  subtext,
  stats,
  footer,
}: {
  eyebrow: string;
  headline: string;
  accentWord: string;
  subtext: string;
  stats: Stat[];
  footer: string;
}) {
  return (
    // Content stacks from the top; the building owns the bottom of the panel, so
    // nothing is ever laid over anything else.
    <div className="relative hidden lg:flex w-[46%] xl:w-[44%] flex-col overflow-hidden bg-[#1b0a42] p-10 xl:p-14">
      <Facade />

      <Link href="/" className="group relative z-10 w-fit">
        <Image
          src={logoImg}
          alt="PGSathi"
          width={160}
          height={56}
          priority
          className="h-11 w-auto object-contain brightness-0 invert transition-opacity group-hover:opacity-75"
        />
      </Link>

      <div className="relative z-10 mt-14 max-w-md xl:mt-16">
        <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300/80">
          <span className="h-px w-8 bg-amber-300/50" />
          {eyebrow}
        </div>

        {/* Tight, heavy and allowed to be big — this line is the panel's whole job. */}
        <h1
          className="mb-6 font-heading text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white xl:text-[3rem]"
          style={{ textWrap: "balance" }}
        >
          {headline} <span className="text-amber-300">{accentWord}</span>
        </h1>

        <p className="max-w-sm text-[15px] leading-relaxed text-violet-200/60">{subtext}</p>
      </div>

      {/* A masthead line, not a leaderboard: the numbers support the claim above
          instead of competing with it for attention. */}
      <div className="relative z-10 mt-10 max-w-lg">
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-white">{s.value}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-violet-300/50">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-medium text-violet-300/35">{footer}</p>
      </div>
    </div>
  );
}
