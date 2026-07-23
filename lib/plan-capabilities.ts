/**
 * lib/plan-capabilities.ts
 * The per-plan feature switches the super-admin controls.
 *
 * These used to be hardcoded as scattered `tier === "PRO"` checks. Now each Plan
 * row carries a `capabilities` JSON, and every gate reads from it — so turning a
 * feature on/off for a plan is a super-admin action, not a code change.
 *
 * Pure module (no DB / server-only imports) so both client components and server
 * code can share the type, labels, and the safe reader.
 */

export type PlanCapabilities = {
  csvExport: boolean; // Reports & CSV export
  csvImport: boolean; // Bulk CSV import
  adsFree: boolean; // hide dashboard ads
  staff: boolean; // staff & team-login management
  leads: boolean; // unlock lead phone numbers
  pgManager: boolean; // access the PG Manager CRM
};

/** Ordered for the admin UI; label is what the super-admin sees next to each toggle. */
export const CAPABILITY_META: { key: keyof PlanCapabilities; label: string; hint: string }[] = [
  { key: "pgManager", label: "PG Manager (CRM)", hint: "Tenants, rent, billing dashboard" },
  { key: "leads", label: "Unlock Lead Numbers", hint: "See enquiry phone numbers" },
  { key: "csvExport", label: "CSV Export", hint: "Download reports as CSV" },
  { key: "csvImport", label: "Bulk CSV Import", hint: "Import tenants from CSV" },
  { key: "staff", label: "Staff & Team Logins", hint: "Manager / Warden accounts" },
  { key: "adsFree", label: "Ad-free Dashboard", hint: "Hide upgrade ads" },
];

export const NO_CAPABILITIES: PlanCapabilities = {
  csvExport: false,
  csvImport: false,
  adsFree: false,
  staff: false,
  leads: false,
  pgManager: false,
};

/** Coerce whatever is stored in Plan.capabilities (Json) into a strict, complete object. */
export function readCapabilities(json: unknown): PlanCapabilities {
  const src = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  return {
    csvExport: !!src.csvExport,
    csvImport: !!src.csvImport,
    adsFree: !!src.adsFree,
    staff: !!src.staff,
    leads: !!src.leads,
    pgManager: !!src.pgManager,
  };
}
