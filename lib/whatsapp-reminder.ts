/**
 * lib/whatsapp-reminder.ts
 * Builds WhatsApp click-to-chat links for rent reminders.
 * No API key needed — uses the free wa.me protocol.
 */

interface ReminderOptions {
  phone: string;     // Tenant phone number (Indian, 10-digit)
  tenantName: string;
  ownerName: string;
  propertyName: string;
  amount: number;    // Amount due in INR
  month: string;     // "2026-07"
  dueDay?: number;   // Day of month rent is due
  upiId?: string;    // Optional UPI ID for payment
}

/** Formats YYYY-MM as "July 2026" */
function fmtMonth(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

/** Formats number as ₹12,500 */
function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Returns a wa.me URL that opens WhatsApp with a pre-filled reminder
 * message to the given tenant phone number.
 */
export function buildRentReminderLink(opts: ReminderOptions): string {
  const phone = opts.phone.replace(/\D/g, "");
  const intlPhone = phone.startsWith("91") ? phone : `91${phone}`;

  const upiLine = opts.upiId
    ? `\n💳 UPI: ${opts.upiId}`
    : "";

  const message = [
    `Hello ${opts.tenantName} 🙏`,
    ``,
    `We would like to remind you on behalf of ${opts.propertyName}:`,
    ``,
    `📅 Month: *${fmtMonth(opts.month)}*`,
    `💰 Rent due: *${fmtINR(opts.amount)}*`,
    opts.dueDay ? `📆 Due date: ${opts.dueDay} ${fmtMonth(opts.month).split(" ")[0]}` : "",
    upiLine,
    ``,
    `Please make the payment as soon as possible.`,
    `Thank you! 🙏`,
    ``,
    `— ${opts.ownerName}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a general WhatsApp message link (for announcements, etc.)
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const intlPhone = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}
