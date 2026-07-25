"use client";

import { Printer } from "lucide-react";

/** Browser print → "Save as PDF". Keeps PDF export dependency-free. */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 print:hidden"
    >
      <Printer size={15} /> Print / PDF
    </button>
  );
}
