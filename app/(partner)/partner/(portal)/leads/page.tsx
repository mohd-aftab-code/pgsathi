import { requirePartner } from "@/lib/partner-auth";
import { LeadsBoard } from "@/components/partner/LeadsBoard";

export const metadata = { title: "Leads — Partner | PGSathi" };

export default async function PartnerLeadsPage() {
  await requirePartner();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Leads</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Jin owners se baat chal rahi hai — registration se pehle wali pipeline.
        </p>
      </div>

      <LeadsBoard />
    </div>
  );
}
