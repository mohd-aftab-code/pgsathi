import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
const FROM = process.env.FROM_EMAIL || "hello@pgsathi.in";

// Send OTP email
export async function sendOtpEmail(to: string, otp: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${otp} - Your PGSathi OTP`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">PGSathi — OTP Verification</h2>
        <p>Hi ${name},</p>
        <p>Your one-time password is:</p>
        <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; color: #6d28d9; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">PGSathi — Apna PG, Apna Sathi</p>
      </div>
    `,
  });
}

// Send new lead notification to owner
export async function sendLeadNotification(
  ownerEmail: string,
  ownerName: string,
  tenantName: string,
  tenantPhone: string,
  pgTitle: string,
  pgSlug: string
) {
  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `New Lead for "${pgTitle}" — PGSathi`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">🎉 New Lead Received!</h2>
        <p>Hi ${ownerName},</p>
        <p>Someone is interested in your PG listing <strong>"${pgTitle}"</strong>.</p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${tenantName}</p>
          <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:${tenantPhone}" style="color: #6d28d9;">${tenantPhone}</a></p>
        </div>
        <a href="https://wa.me/91${tenantPhone}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 16px;">
          WhatsApp करें
        </a>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/owner/leads" style="color: #6d28d9;">Dashboard में सभी leads देखें →</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">PGSathi — Apna PG, Apna Sathi</p>
      </div>
    `,
  });
}
