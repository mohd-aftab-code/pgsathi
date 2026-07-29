import nodemailer from "nodemailer";
import { 
  getOtpEmail, 
  getWelcomeTenantEmail, 
  getWelcomeOwnerEmail, 
  getWelcomePartnerEmail, 
  getOwnerInviteEmail,
  getLeadNotificationEmail,
  getPartnerApplicationReceivedEmail,
  getPartnerStatusEmail,
  getListingStatusEmail,
  getPayoutEmail,
  getSubscriptionActiveEmail,
  getSubscriptionExpiryEmail,
  getAdminNewUserNotificationEmail
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

// Send partner application received email
export async function sendPartnerApplicationReceivedEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Application Received - PGSathi Partner Program",
    html: getPartnerApplicationReceivedEmail(name),
  });
}

// Send partner status update (Approve/Reject/Suspend)
export async function sendPartnerStatusEmail(
  to: string,
  name: string,
  status: string,
  rejectReason?: string
) {
  const subject = status === "APPROVED" 
    ? "Welcome to the PGSathi Partner Program! 🎉"
    : `Your PGSathi Partner Account Status: ${status}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: getPartnerStatusEmail(name, status, rejectReason),
  });
}

// Send listing status update (Approve/Reject)
export async function sendListingStatusEmail(
  to: string,
  name: string,
  pgTitle: string,
  status: string,
  isPartner: boolean = false
) {
  const subject = status === "ACTIVE"
    ? `Your PG "${pgTitle}" is now LIVE! 🎉`
    : `Update required for "${pgTitle}"`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: getListingStatusEmail(name, pgTitle, status, isPartner),
  });
}


// Send payout completion email
export async function sendPayoutEmail(
  to: string,
  name: string,
  amount: number,
  method: string,
  reference?: string
) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Payout Processed: ₹${amount.toLocaleString('en-IN')}`,
    html: getPayoutEmail(name, amount, method, reference),
  });
}

// Send subscription active email
export async function sendSubscriptionActiveEmail(
  to: string,
  name: string,
  planName: string,
  amount: number
) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Your Subscription is Active! 🚀",
    html: getSubscriptionActiveEmail(name, planName, amount),
  });
}

// Send subscription expiry reminder email
export async function sendSubscriptionExpiryEmail(
  to: string,
  name: string,
  daysLeft: number
) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Action Required: Subscription expires in ${daysLeft} day(s)`,
    html: getSubscriptionExpiryEmail(name, daysLeft),
  });
}

// Send notification to admin when a new user registers
export async function sendAdminNewUserNotificationEmail(name: string, role: string, phone: string, email: string) {
  const adminEmail = process.env.ADMIN_EMAIL || "pgsathi.support@gmail.com";
  
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: `New ${role} Registration: ${name}`,
    html: getAdminNewUserNotificationEmail(name, role, phone, email),
  });
}
