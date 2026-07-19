"use client";

import { FileDown } from "lucide-react";
import toast from "react-hot-toast";

interface ExportCsvButtonProps {
  data: any[];
  filename: string;
  tier: string;
  headers?: { key: string; label: string }[];
}

export function ExportCsvButton({ data, filename, tier, headers }: ExportCsvButtonProps) {
  // Scale is the tier above Pro — it must not be locked out of an export Pro already has.
  const canExport = tier === "PRO" || tier === "SCALE";

  const handleExport = () => {
    if (!canExport) {
      toast.error("CSV Export is a Pro/Scale feature. Please upgrade your plan.");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Determine headers
    const keys = headers ? headers.map((h) => h.key) : Object.keys(data[0]);
    const labels = headers ? headers.map((h) => h.label) : keys;

    // Create CSV content
    const csvContent = [
      labels.join(","),
      ...data.map((row) =>
        keys
          .map((key) => {
            const val = row[key];
            // Handle commas, quotes, and newlines in values
            if (val === null || val === undefined) return '""';
            const strVal = String(val).replace(/"/g, '""');
            if (strVal.search(/("|,|\n)/g) >= 0) {
              return `"${strVal}"`;
            }
            return strVal;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className={`btn-outline py-1.5 px-3 text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-1.5 ${
        canExport ? "" : "opacity-75"
      }`}
      title={canExport ? "Export to CSV" : "Pro/Scale feature"}
    >
      <FileDown className="h-4 w-4" /> Export CSV
      {!canExport && <span className="ml-1 text-[10px] bg-violet-100 text-violet-700 px-1 rounded">PRO</span>}
    </button>
  );
}
