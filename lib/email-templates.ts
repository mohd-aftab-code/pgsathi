const LOGO_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/logo-vertical.png`
  : "https://pgsathi.in/logo-vertical.png"; // Fallback if logo not found

const BRAND_COLOR = "#6d28d9"; // Purple
const BRAND_SECONDARY = "#f5f3ff"; // Light purple bg

function baseTemplate(content: string, preheader: string = "PGSathi Notification") {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PGSathi</title>
      <style>
        /* Mobile-friendly resets */
        body { margin: 0; padding: 0; min-width: 100%; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; font-family: sans-serif; color: #334155; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #ffffff; padding: 20px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border: none; box-shadow: none; overflow: hidden; }
        
        .header { padding: 20px 0 0 0; text-align: center; }
        .logo { height: 44px; width: auto; display: block; margin: 0 auto; }
        
        .content { padding: 20px 0; color: #374151; font-size: 15px; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; letter-spacing: -0.5px; }
        .content p { margin-top: 0; margin-bottom: 16px; }
        .content ul { padding-left: 20px; margin-top: 0; margin-bottom: 24px; }
        .content li { margin-bottom: 10px; }
        
        .btn-container { text-align: center; margin: 32px 0 16px 0; }
        .btn { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; }
        
        .card { background-color: ${BRAND_SECONDARY}; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        
        .footer { background-color: #ffffff; padding: 20px 0; text-align: center; border-top: 1px solid #f1f5f9; }
        .footer p { color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0; }
        .footer-logo { height: 28px; margin-bottom: 16px; opacity: 0.6; filter: grayscale(100%); }
        .social-links { margin-top: 16px; }
        .social-links a { display: inline-block; margin: 0 8px; color: #94a3b8; text-decoration: none; font-size: 12px; font-weight: 600; }

        @media screen and (max-width: 600px) {
          .wrapper { padding: 10px 0; }
          .header, .content, .footer { padding: 20px 0; }
          .btn { width: 100%; box-sizing: border-box; }
        }
      </style>
    </head>
    <body>
      <!-- Preheader for email clients -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
        ${preheader}
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
      </div>
      <div class="wrapper">
        <table class="main" role="presentation">
          <tr>
            <td class="header">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}">
                <img src="${LOGO_URL}" alt="PGSathi" class="logo" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <img src="${LOGO_URL}" alt="PGSathi" class="footer-logo" />
              <p><strong>PGSathi</strong> — India's No.1 Zero-Brokerage PG Platform</p>
              <p>You received this email because you signed up or interacted with PGSathi.</p>
              <div class="social-links">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/contact">Help Center</a> &bull;
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/privacy">Privacy Policy</a> &bull;
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/terms">Terms of Service</a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}

export function getWelcomeTenantEmail(name: string) {
  const content = `
    <h2>Welcome to PGSathi, ${name}! 🎉</h2>
    <p>We are thrilled to have you on board. PGSathi is India's most trusted, zero-brokerage platform for finding the perfect PG or hostel.</p>
    <p>Here’s what you can do next:</p>
    <ul>
      <li>🔍 <strong>Search</strong> through hundreds of verified PGs in your city.</li>
      <li>📅 <strong>Book visits</strong> directly with owners—no middlemen!</li>
      <li>📱 <strong>Manage</strong> your rent, complaints, and food menu from our app.</li>
    </ul>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/search" class="btn">Explore PGs Now</a>
    </div>
  `;
  return baseTemplate(content, "Welcome to PGSathi - Find your perfect PG today!");
}

export function getWelcomeOwnerEmail(name: string, phone?: string, password?: string) {
  const credentialsHtml = phone && password ? `
    <div class="card" style="text-align: center; margin-bottom: 24px;">
      <p style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 16px;">Your Login Credentials</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Login ID:</strong> <span style="color: ${BRAND_COLOR}; font-weight: 600;">${phone}</span></p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: 700; padding: 6px 12px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; display: inline-block; margin-top: 8px;">${password}</span></p>
    </div>
  ` : "";

  const content = `
    <h2>Welcome to PGSathi, ${name}! 🏢</h2>
    <p>Thank you for partnering with us. We're here to help you grow your PG business and find genuine, verified tenants—without paying any brokerage.</p>
    ${credentialsHtml}
    <p>Get started by setting up your first listing:</p>
    <ul>
      <li>📝 <strong>List your PG</strong> with attractive photos and clear pricing.</li>
      <li>🔔 <strong>Get direct leads</strong> from interested tenants via WhatsApp or calls.</li>
      <li>💼 <strong>Manage everything</strong> from rent collection to staff in one dashboard.</li>
    </ul>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/owner" class="btn">Go to Dashboard</a>
    </div>
  `;
  return baseTemplate(content, "Welcome to PGSathi - Grow your PG business with zero brokerage.");
}

export function getWelcomePartnerEmail(name: string) {
  const content = `
    <h2>Welcome to the Partner Program, ${name}! 🤝</h2>
    <p>We are excited to have you join our network. With PGSathi, you can earn recurring lifetime commissions by bringing PG owners to our platform.</p>
    <div class="card">
      <p style="margin-bottom: 12px; font-weight: 700; color: #1e293b;">Your Partner Journey:</p>
      <ul style="margin-bottom: 0;">
        <li>Register PG Owners directly from your portal.</li>
        <li>Help them add their PGs to the platform.</li>
        <li>Earn a commission whenever they subscribe to a paid plan!</li>
      </ul>
    </div>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">Access Partner Portal</a>
    </div>
  `;
  return baseTemplate(content, "Welcome to PGSathi Partner Program - Start earning today!");
}

export function getOwnerInviteEmail(name: string, loginId: string, tempPass: string, pgTitle?: string) {
  const pgText = pgTitle 
    ? `Your PG <strong>"${pgTitle}"</strong> has just been registered on <strong>India's fastest growing zero-brokerage platform</strong>.`
    : `Your account has just been registered on <strong>India's fastest growing zero-brokerage platform</strong> by your partner.`;

  const content = `
    <h2>Welcome to PGSathi, ${name}! 🎉</h2>
    <p>${pgText}</p>
    <p>You can now log in to your Owner Dashboard to manage your photos, update pricing, and view tenant leads.</p>
    
    <div class="card" style="text-align: center;">
      <p style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 16px;">Your Login Credentials</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Login ID:</strong> <span style="color: ${BRAND_COLOR}; font-weight: 600;">${loginId}</span></p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: 700; padding: 6px 12px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; display: inline-block; margin-top: 8px;">${tempPass}</span></p>
    </div>

    <p style="text-align: center; color: #dc2626; font-size: 13px;"><em>⚠️ Please change your password immediately after your first login.</em></p>
    
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/login" class="btn">Log In to Dashboard</a>
    </div>
  `;
  return baseTemplate(content, "Your PGSathi account has been created by your partner.");
}

export function getOtpEmail(name: string, otp: string) {
  const content = `
    <h2>Verification Code 🔒</h2>
    <p>Hi ${name},</p>
    <p>We received a request to verify your account. Please use the secure code below:</p>
    
    <div style="background-color: ${BRAND_SECONDARY}; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; border: 1px dashed #c4b5fd;">
      <span style="font-size: 48px; font-weight: 800; color: ${BRAND_COLOR}; letter-spacing: 8px; display: block;">${otp}</span>
    </div>
    
    <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
  `;
  return baseTemplate(content, `${otp} is your PGSathi verification code`);
}

export function getLeadNotificationEmail(ownerName: string, tenantName: string, tenantPhone: string, pgTitle: string, pgSlug: string) {
  const content = `
    <h2>🎉 New Lead Received!</h2>
    <p>Hi ${ownerName},</p>
    <p>Great news! Someone is interested in your PG listing <strong>"${pgTitle}"</strong>.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Tenant Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Name:</strong> ${tenantName}</p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Phone:</strong> <a href="tel:${tenantPhone}" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">${tenantPhone}</a></p>
    </div>
    
    <div class="btn-container">
      <a href="https://wa.me/91${tenantPhone}" class="btn" style="background-color: #25D366; width: 100%; box-sizing: border-box; max-width: 300px;">
        Chat on WhatsApp
      </a>
    </div>
    
    <p style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/owner/leads" style="color: ${BRAND_COLOR}; font-weight: 600; text-decoration: none;">View all leads in Dashboard &rarr;</a>
    </p>
  `;
  return baseTemplate(content, `New lead received from ${tenantName} for ${pgTitle}`);
}

export function getPartnerApplicationReceivedEmail(name: string) {
  const content = `
    <h2>Application Received! 📝</h2>
    <p>Hi ${name},</p>
    <p>Thank you for submitting your profile details for the <strong>PGSathi Partner Program</strong>.</p>
    <p>Our team is currently reviewing your application. You will receive another email as soon as your account is approved and activated.</p>
    <p>If we need any further information, we will contact you directly.</p>
  `;
  return baseTemplate(content, "Your PGSathi Partner application has been received");
}

export function getPartnerStatusEmail(name: string, status: string, rejectReason?: string) {
  let statusText = "";
  let message = "";
  
  if (status === "APPROVED") {
    statusText = "Account Approved! 🎉";
    message = `<p>Congratulations! Your Partner application has been approved.</p>
               <p>You can now start registering PG Owners and earning lifetime commissions.</p>
               <div class="btn-container">
                 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">Go to Partner Dashboard</a>
               </div>`;
  } else if (status === "REJECTED") {
    statusText = "Application Update";
    message = `<p>Thank you for your interest in the PGSathi Partner Program.</p>
               <p>Unfortunately, your application was not approved at this time.</p>
               ${rejectReason ? `<div class="card"><p><strong>Reason:</strong> ${rejectReason}</p></div>` : ""}
               <p>If you have any questions, feel free to reply to this email.</p>`;
  } else if (status === "SUSPENDED") {
    statusText = "Account Suspended";
    message = `<p>Your PGSathi Partner account has been suspended.</p>
               <p>Please contact our support team for more details.</p>`;
  }

  const content = `
    <h2>Hi ${name},</h2>
    <h3>${statusText}</h3>
    ${message}
  `;
  return baseTemplate(content, `Your Partner Account Status: ${status}`);
}

export function getListingStatusEmail(name: string, pgTitle: string, status: string, isPartner: boolean = false) {
  let message = "";
  
  if (status === "ACTIVE") {
    message = isPartner 
      ? `<p>Great news! The PG listing <strong>"${pgTitle}"</strong> you registered is now <strong>LIVE</strong>.</p>
         <p>You will start earning commissions once the owner subscribes to a paid plan.</p>`
      : `<p>Congratulations! Your PG listing <strong>"${pgTitle}"</strong> is now <strong>LIVE</strong> on PGSathi.</p>
         <p>Tenants can now find your PG and contact you directly.</p>`;
  } else if (status === "REJECTED") {
    message = isPartner
      ? `<p>The PG listing <strong>"${pgTitle}"</strong> you registered could not be approved.</p>`
      : `<p>Your PG listing <strong>"${pgTitle}"</strong> requires some changes before it can go live.</p>
         <p>Please check your dashboard or reply to this email for assistance.</p>`;
  }

  const content = `
    <h2>Hi ${name},</h2>
    ${message}
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">View in Dashboard</a>
    </div>
  `;
  return baseTemplate(content, `Update on PG Listing: ${pgTitle}`);
}

export function getPayoutEmail(name: string, amount: number, method: string, reference?: string) {
  const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  const content = `
    <h2>Payout Completed! 💸</h2>
    <p>Hi ${name},</p>
    <p>We've successfully transferred your commission payout of <strong>${formattedAmount}</strong>.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Payout Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Amount:</strong> ${formattedAmount}</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Method:</strong> ${method}</p>
      ${reference ? `<p style="margin-bottom: 0; font-size: 16px;"><strong>Reference No:</strong> ${reference}</p>` : ""}
    </div>
    
    <p>Keep up the great work!</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">Go to Dashboard</a>
    </div>
  `;
  return baseTemplate(content, `You've received a payout of ${formattedAmount} from PGSathi`);
}

export function getSubscriptionActiveEmail(name: string, planName: string, amount: number) {
  const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  const content = `
    <h2>Subscription Activated! 🚀</h2>
    <p>Hi ${name},</p>
    <p>Thank you for upgrading! Your <strong>${planName}</strong> plan is now active.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Transaction Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Plan:</strong> ${planName}</p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Amount Paid:</strong> ${formattedAmount}</p>
    </div>
    
    <p>Your premium features are unlocked. Head over to your dashboard to make the most out of your PG listing.</p>
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/owner" class="btn">Go to Dashboard</a>
    </div>
  `;
  return baseTemplate(content, `Your PGSathi ${planName} Subscription is Active`);
}

export function getSubscriptionExpiryEmail(name: string, daysLeft: number) {
  const content = `
    <h2>Action Required: Subscription Expiring ⚠️</h2>
    <p>Hi ${name},</p>
    <p>Your PGSathi subscription will expire in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.</p>
    <p>To avoid any interruption in receiving leads and managing your PG, please renew your subscription soon.</p>
    
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/owner/plans" class="btn">Renew Now</a>
    </div>
  `;
  return baseTemplate(content, `Your PGSathi subscription expires in ${daysLeft} day(s)`);
}

export function getAdminNewUserNotificationEmail(name: string, role: string, phone: string, email: string) {
  const content = `
    <h2>New User Registration 🔔</h2>
    <p>A new <strong>${role}</strong> has just registered on PGSathi.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">User Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Role:</strong> ${role}</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Name:</strong> ${name}</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Phone:</strong> ${phone}</p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
    </div>
    
    <div class="btn-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/admin/users" class="btn">View in Admin Dashboard</a>
    </div>
  `;
  return baseTemplate(content, `New ${role} registration: ${name}`);
}
