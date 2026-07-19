"use client";

import { Printer } from "lucide-react";

/**
 * Prints the current receipt page. The page's print stylesheet hides the
 * dashboard chrome, so the browser's "Save as PDF" produces a clean receipt.
 */
export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      <Printer size={16} /> Print / Save as PDF
    </button>
  );
}
