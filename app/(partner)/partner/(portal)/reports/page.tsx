import Link from "next/link";
import { Download, FileBarChart, FileSpreadsheet, FileText } from "lucide-react";
import { requirePartner } from "@/lib/partner-auth";
import { buildReport, REPORTS, type ReportType } from "@/lib/partner-reports";
import { PrintButton } from "@/components/partner/PrintButton";

export const metadata = { title: "Reports — Partner | PGSathi" };

export default async function PartnerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const ctx = await requirePartner();
  const sp = await searchParams;
  const type = (REPORTS.some((r) => r.type === sp.type) ? sp.type : "pg") as ReportType;
  const active = REPORTS.find((r) => r.type === type)!;
  const data = await buildReport(ctx.partnerId, type);

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Reports</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Choose a report, preview, download CSV, or print PDF.</p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:hidden">
        {REPORTS.map((r) => (
          <Link
            key={r.type}
            href={`/partner/reports?type=${r.type}`}
            className={`rounded-2xl border-2 p-4 transition-colors ${
              type === r.type
                ? "border-primary-400 bg-primary-50 dark:bg-primary-950/40"
                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <FileBarChart size={18} className={type === r.type ? "text-primary-600 dark:text-primary-400" : "text-neutral-400"} />
            <div className={`font-bold text-sm mt-2 ${type === r.type ? "text-primary-800 dark:text-primary-300" : "text-neutral-800 dark:text-neutral-200"}`}>{r.label}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{r.desc}</div>
          </Link>
        ))}
      </div>

      {/* Preview + export */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-white">{data.title}</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{data.rows.length} rows · Partner {ctx.partnerCode}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <PrintButton />
            <a
              href={`/api/partner/reports?type=${type}&format=csv`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Download size={15} /> CSV
            </a>
            <a
              href={`/api/partner/reports?type=${type}&format=xlsx`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold"
            >
              <FileSpreadsheet size={15} /> Excel
            </a>
            <a
              href={`/api/partner/reports?type=${type}&format=pdf`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
            >
              <FileText size={15} /> PDF
            </a>
          </div>
        </div>

        {data.rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No data available for this report yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50">
                  {data.columns.map((c) => (
                    <th key={c} className="px-4 py-2.5 font-bold whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
