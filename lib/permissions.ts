/**
 * lib/permissions.ts (server-only)
 * Permission checks backed by the `role_permissions` table, so what a role may do
 * can be tightened by an admin without a deploy.
 *
 * FAIL-CLOSED: a permission key with no row is treated as DENIED. Any new
 * permission the code checks must also be seeded, otherwise the feature stays
 * locked. This is deliberate — silently granting access on a missing row is how
 * permission systems leak.
 */
import "server-only";
import { db } from "@/lib/db";

/** All permission keys the code enforces. Keep in sync with the seed. */
export const PERMISSIONS = {
  PG_REGISTER: "pg.register",
  PG_VIEW_OWN: "pg.view.own",
  PG_EDIT_OWN: "pg.edit.own",
  PG_DELETE: "pg.delete",
  OWNER_CONTACT_VIEW: "owner.contact.view",
  EARNINGS_VIEW_OWN: "earnings.view.own",
  REPORTS_EXPORT: "reports.export",
  SETTINGS_MANAGE_OWN: "settings.manage.own",
  PARTNER_APPROVE: "partner.approve",
  PARTNER_SUSPEND: "partner.suspend",
  EARNINGS_SET_AMOUNT: "earnings.set_amount",
  EARNINGS_APPROVE: "earnings.approve",
  PAYOUT_CREATE: "payout.create",
  REPORTS_VIEW_ALL: "reports.view.all",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Every permission granted to a role, as a Set for cheap repeated checks. */
export async function getPermissions(role: string): Promise<Set<string>> {
  const rows = await db.rolePermission.findMany({
    where: { role, allowed: true },
    select: { permission: true },
  });
  return new Set(rows.map((r) => r.permission));
}

/** Single check. Returns false when the row is missing (fail-closed). */
export async function can(role: string, permission: PermissionKey): Promise<boolean> {
  const row = await db.rolePermission.findUnique({
    where: { role_permission: { role, permission } },
    select: { allowed: true },
  });
  return row?.allowed === true;
}

/** Throws when the role lacks the permission — for use inside API routes. */
export async function assertCan(role: string, permission: PermissionKey): Promise<void> {
  if (!(await can(role, permission))) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
