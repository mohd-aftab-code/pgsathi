/**
 * lib/notifications.ts
 * In-app notification helper. Creating a notification never throws — a failed
 * notify() must never break the primary user action that triggered it.
 */
import "server-only";
import { db } from "@/lib/db";

export type NotifType =
  | "LEAD"
  | "VISIT"
  | "PAYMENT"
  | "RENT_DUE"
  | "COMPLAINT"
  | "REVIEW"
  | "SUBSCRIPTION"
  | "SYSTEM"
  | "PARTNER_PG"
  | "PARTNER_EARNING";

export async function notify(input: {
  userId: number | null | undefined;
  type: NotifType;
  title: string;
  message?: string | null;
  link?: string | null;
}): Promise<void> {
  try {
    if (!input.userId || Number.isNaN(input.userId)) return;
    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title.slice(0, 180),
        message: input.message ?? null,
        link: input.link ?? null,
      },
    });
  } catch (e) {
    console.error("[notify] failed (non-fatal):", e);
  }
}
