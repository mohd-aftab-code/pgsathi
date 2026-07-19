/**
 * components/dashboard/AdSlot.tsx
 * Shown to Starter/Growth owners only — Pro & Scale plans are ad-free.
 * Placeholder until a real Google AdSense publisher ID is available; swap the
 * inner box for the <ins class="adsbygoogle"> unit once AdSense is approved.
 */
export function AdSlot() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-3">
      <span className="block text-center text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
        Advertisement
      </span>
      <div className="rounded-lg bg-neutral-100 h-24 flex items-center justify-center px-2">
        <span className="text-[10px] text-neutral-400 text-center leading-snug">
          Ad space — upgrade to Pro or Scale to remove ads
        </span>
      </div>
    </div>
  );
}
