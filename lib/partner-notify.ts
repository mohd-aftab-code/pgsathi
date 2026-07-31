/**
 * lib/partner-notify.ts (server-only)
 * One entry point for everything the programme tells a partner.
 *
 * `PartnerSetting` has had notifyInApp / notifyEmail / notifyWhatsapp toggles
 * since the portal shipped, but nothing read them — every notification was
 * written regardless, and email only ever went out for payouts. This routes a
 * single message through whichever channels the partner actually asked for.
 *
 * Nothing here throws: a notification failure must never roll back the money
 * operation that triggered it.
 */
import "server-only";
import { db } from "@/lib/db";
import { notify, type NotifType } from "@/lib/notifications";
import { sendPartnerAlertEmail } from "@/lib/email";

export type PartnerMessage = {
  partnerId: number;
  type?: NotifType;
  title: string;
  message: string;
  link?: string;
  /** Skip email even when the partner has it on — for low-value chatter. */
  inAppOnly?: boolean;
};

/**
 * WhatsApp delivery needs a Business API endpoint. Without one configured the
 * toggle is honest about being unavailable rather than silently doing nothing —
 * see `whatsappConfigured()`, which the settings UI reads.
 */
export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

async function sendWhatsApp(phone: string, body: string): Promise<void> {
  if (!whatsappConfigured()) return;
  const to = phone.replace(/\D/g, "");
  const intl = to.startsWith("91") ? to : `91${to}`;
  try {
    await fetch(process.env.WHATSAPP_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: intl,
        type: "text",
        text: { body },
      }),
    });
  } catch (e) {
    console.error("[partner-notify] whatsapp send failed (non-fatal):", e);
  }
}

/** Delivers one message over every channel the partner has enabled. */
export async function notifyPartner(msg: PartnerMessage): Promise<void> {
  try {
    const partner = await db.partnerProfile.findUnique({
      where: { id: msg.partnerId },
      select: {
        userId: true,
        user: { select: { name: true, email: true, phone: true } },
        settings: { select: { notifyInApp: true, notifyEmail: true, notifyWhatsapp: true } },
      },
    });
    if (!partner) return;

    // No settings row yet = the defaults the column definitions promise.
    const prefs = partner.settings ?? { notifyInApp: true, notifyEmail: true, notifyWhatsapp: false };

    if (prefs.notifyInApp) {
      await notify({
        userId: partner.userId,
        type: msg.type ?? "PARTNER_EARNING",
        title: msg.title,
        message: msg.message,
        link: msg.link ?? null,
      });
    }

    if (prefs.notifyEmail && !msg.inAppOnly && partner.user.email) {
      sendPartnerAlertEmail(partner.user.email, partner.user.name, msg.title, msg.message, msg.link).catch((e) =>
        console.error("[partner-notify] email failed (non-fatal):", e),
      );
    }

    if (prefs.notifyWhatsapp && partner.user.phone) {
      await sendWhatsApp(partner.user.phone, `*${msg.title}*\n\n${msg.message}`);
    }
  } catch (e) {
    console.error("[partner-notify] failed (non-fatal):", e);
  }
}
