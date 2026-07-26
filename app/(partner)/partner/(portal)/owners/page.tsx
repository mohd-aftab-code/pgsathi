import { requirePartner } from "@/lib/partner-auth";
import { OwnerManager } from "@/components/partner/OwnerManager";

export const metadata = { title: "Mere Owners — Partner | PGSathi" };

export default async function PartnerOwnersPage() {
  // Guard only — all data is loaded client-side from /api/partner/owners, which
  // scopes every query by the session's partnerId.
  await requirePartner();
  return <OwnerManager />;
}
