import nodemailer from "nodemailer";
import { 
  getOtpEmail, 
  getWelcomeTenantEmail, 
  getWelcomeOwnerEmail, 
  getWelcomePartnerEmail, 
  getOwnerInviteEmail,
  getLeadNotificationEmail
} from "./email-templates";

const FROM = process.env.FROM_EMAIL || "hello@pgsathi.in";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send generic welcome email
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  let html = "";
  let subject = "Welcome to PGSathi!";
  
  if (role === "TENANT") {
    html = getWelcomeTenantEmail(name);
    subject = "Welcome to PGSathi - Find your perfect PG today!";
  } else if (role === "OWNER") {
    html = getWelcomeOwnerEmail(name);
    subject = "Welcome to PGSathi - Grow your PG business with zero brokerage";
  } else if (role === "PARTNER") {
    html = getWelcomePartnerEmail(name);
    subject = "Welcome to PGSathi Partner Program - Start earning today!";
  } else {
    // Fallback if other roles
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });
}

// Send OTP email
export async function sendOtpEmail(to: string, otp: string, name: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `${otp} - Your PGSathi OTP`,
    html: getOtpEmail(name, otp),
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
  await transporter.sendMail({
    from: FROM,
    to: ownerEmail,
    subject: `New Lead for "${pgTitle}" — PGSathi`,
    html: getLeadNotificationEmail(ownerName, tenantName, tenantPhone, pgTitle, pgSlug),
  });
}

// Send owner invite with credentials
export async function sendOwnerInviteEmail(
  to: string,
  name: string,
  pgTitle: string | undefined,
  loginId: string,
  tempPass: string
) {
  const subject = pgTitle 
    ? `Claim your PG Listing "${pgTitle}" on PGSathi`
    : `Your PGSathi Owner Account Credentials`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: getOwnerInviteEmail(name, loginId, tempPass, pgTitle),
  });
}
