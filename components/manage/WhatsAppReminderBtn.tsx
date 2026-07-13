"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface WhatsAppBtnProps {
  phone: string;
  tenantName: string;
  amount: number;
  month: string;
  type?: string;
}

export function WhatsAppReminderBtn({ phone, tenantName, amount, month, type = "Rent" }: WhatsAppBtnProps) {
  const rawPhone = phone?.replace(/\D/g, "");
  const intlPhone = rawPhone?.startsWith("91") ? rawPhone : `91${rawPhone}`;

  const message = encodeURIComponent(
    `Hi ${tenantName}! 👋\n\nYe ek friendly reminder hai ki aapka *${type} for ${month}* abhi tak pending hai.\n\n💰 Amount Due: *₹${amount.toLocaleString("en-IN")}*\n\nPlease jald se jald payment kar dein. Dhanyawad! 🙏\n\n— PGSathi CRM`
  );

  const waUrl = `https://wa.me/${intlPhone}?text=${message}`;

  return (
    <Link
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-bold transition-colors"
      title="Send WhatsApp Reminder"
    >
      <MessageCircle size={13} />
      <span className="hidden sm:inline">WhatsApp</span>
    </Link>
  );
}
