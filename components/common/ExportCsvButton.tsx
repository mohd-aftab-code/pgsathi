"use client";

import { FileDown } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ExportCsvButtonProps {
  data: any[];
  filename: string;
  /** Whether the owner's plan unlocks CSV export — resolved from the DB plan
   *  capabilities (super-admin controlled), no longer a hardcoded tier check. */
  canExport: boolean;
  headers?: { key: string; label: string }[];
}

export function ExportCsvButton({ data, filename, canExport, headers }: ExportCsvButtonProps) {
  const router = useRouter();

  const handleExport = () => {
    if (!canExport) {
      // Locked → take them straight to the plans page instead of a dead-end toast
      toast("CSV Export is available from the Growth plan", { icon: "🔒" });
      router.push("/dashboard/owner/subscription/upgrade");
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
      title={canExport ? "Export to CSV" : "Upgrade your plan to unlock CSV export"}
    >
      <FileDown className="h-4 w-4" /> Export CSV
      {!canExport && <span className="ml-1 text-[10px] bg-violet-100 text-violet-700 px-1 rounded">PRO</span>}
    </button>
  );
}
