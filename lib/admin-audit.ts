/**
 * lib/admin-audit.ts (server-only)
 * Records admin actions on money/partners with before/after snapshots.
 *
 * Every earning-amount change and partner status change must be traceable —
 * who, when, from what to what. Never throws: an audit failure must not block
 * the action, but it is logged so we notice.
 */
import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** Confirms the caller is an ADMIN and returns their id + name, else null. */
export async function getAdmin(): Promise<{ id: number; name: string } | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const id = parseInt(session.user.id, 10);
  if (Number.isNaN(id)) return null;
  return { id, name: session.user.name ?? "Admin" };
}

export async function adminAudit(input: {
  adminId: number;
  actor?: string;
  action: string;
  entity?: string;
  entityId?: number;
  before?: any;
  after?: any;
}): Promise<void> {
  try {
    await db.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        actor: input.actor ?? null,
        action: input.action.slice(0, 160),
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        before: input.before ?? undefined,
        after: input.after ?? undefined,
      },
    });
  } catch (e) {
    console.error("[adminAudit] failed (non-fatal):", e);
  }
}
