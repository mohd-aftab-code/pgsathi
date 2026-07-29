const fs = require('fs');

const newTemplates = `

export function getPartnerStatusEmail(name: string, status: string, rejectReason?: string) {
  let statusText = "";
  let message = "";
  
  if (status === "APPROVED") {
    statusText = "Account Approved! 🎉";
    message = \`<p>Congratulations! Your Partner application has been approved.</p>
               <p>You can now start registering PG Owners and earning lifetime commissions.</p>
               <div class="btn-container">
                 <a href="\${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">Go to Partner Dashboard</a>
               </div>\`;
  } else if (status === "REJECTED") {
    statusText = "Application Update";
    message = \`<p>Thank you for your interest in the PGSathi Partner Program.</p>
               <p>Unfortunately, your application was not approved at this time.</p>
               \${rejectReason ? \`<div class="card"><p><strong>Reason:</strong> \${rejectReason}</p></div>\` : ""}
               <p>If you have any questions, feel free to reply to this email.</p>\`;
  } else if (status === "SUSPENDED") {
    statusText = "Account Suspended";
    message = \`<p>Your PGSathi Partner account has been suspended.</p>
               <p>Please contact our support team for more details.</p>\`;
  }

  const content = \`
    <h2>Hi \${name},</h2>
    <h3>\${statusText}</h3>
    \${message}
  \`;
  return baseTemplate(content, \`Your Partner Account Status: \${status}\`);
}

export function getListingStatusEmail(name: string, pgTitle: string, status: string, isPartner: boolean = false) {
  let message = "";
  
  if (status === "ACTIVE") {
    message = isPartner 
      ? \`<p>Great news! The PG listing <strong>"\${pgTitle}"</strong> you registered is now <strong>LIVE</strong>.</p>
         <p>You will start earning commissions once the owner subscribes to a paid plan.</p>\`
      : \`<p>Congratulations! Your PG listing <strong>"\${pgTitle}"</strong> is now <strong>LIVE</strong> on PGSathi.</p>
         <p>Tenants can now find your PG and contact you directly.</p>\`;
  } else if (status === "REJECTED") {
    message = isPartner
      ? \`<p>The PG listing <strong>"\${pgTitle}"</strong> you registered could not be approved.</p>\`
      : \`<p>Your PG listing <strong>"\${pgTitle}"</strong> requires some changes before it can go live.</p>
         <p>Please check your dashboard or reply to this email for assistance.</p>\`;
  }

  const content = \`
    <h2>Hi \${name},</h2>
    \${message}
    <div class="btn-container">
      <a href="\${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">View in Dashboard</a>
    </div>
  \`;
  return baseTemplate(content, \`Update on PG Listing: \${pgTitle}\`);
}

export function getPayoutEmail(name: string, amount: number, method: string, reference?: string) {
  const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const content = \`
    <h2>Payout Completed! 💸</h2>
    <p>Hi \${name},</p>
    <p>We've successfully transferred your commission payout of <strong>\${formattedAmount}</strong>.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Payout Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Amount:</strong> \${formattedAmount}</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Method:</strong> \${method}</p>
      \${reference ? \`<p style="margin-bottom: 0; font-size: 16px;"><strong>Reference No:</strong> \${reference}</p>\` : ""}
    </div>
    
    <p>Keep up the great work!</p>
  \`;
  return baseTemplate(content, \`You've received a payout of \${formattedAmount} from PGSathi\`);
}

export function getSubscriptionActiveEmail(name: string, planName: string, amount: number) {
  const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const content = \`
    <h2>Subscription Activated! 🚀</h2>
    <p>Hi \${name},</p>
    <p>Thank you for upgrading! Your <strong>\${planName}</strong> plan is now active.</p>
    
    <div class="card">
      <p style="margin-bottom: 12px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Transaction Details</p>
      <p style="margin-bottom: 8px; font-size: 16px;"><strong>Plan:</strong> \${planName}</p>
      <p style="margin-bottom: 0; font-size: 16px;"><strong>Amount Paid:</strong> \${formattedAmount}</p>
    </div>
    
    <p>Your premium features are unlocked. Head over to your dashboard to make the most out of your PG listing.</p>
    <div class="btn-container">
      <a href="\${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard" class="btn">Go to Dashboard</a>
    </div>
  \`;
  return baseTemplate(content, \`Your PGSathi \${planName} Subscription is Active\`);
}

export function getSubscriptionExpiryEmail(name: string, daysLeft: number) {
  const content = \`
    <h2>Action Required: Subscription Expiring ⚠️</h2>
    <p>Hi \${name},</p>
    <p>Your PGSathi subscription will expire in <strong>\${daysLeft} day\${daysLeft === 1 ? '' : 's'}</strong>.</p>
    <p>To avoid any interruption in receiving leads and managing your PG, please renew your subscription soon.</p>
    
    <div class="btn-container">
      <a href="\${process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in'}/dashboard/owner/plans" class="btn">Renew Now</a>
    </div>
  \`;
  return baseTemplate(content, \`Your PGSathi subscription expires in \${daysLeft} day(s)\`);
}
`;

fs.appendFileSync('lib/email-templates.ts', newTemplates);
console.log("Appended templates.");
