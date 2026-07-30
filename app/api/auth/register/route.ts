import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail, sendPartnerApplicationReceivedEmail, sendAdminNewUserNotificationEmail } from "@/lib/email";
import { z } from "zod";
import { withErrorHandler } from "@/lib/api-error-handler";

type AllowedRole = "TENANT" | "OWNER" | "PARTNER";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["TENANT", "OWNER", "PARTNER"]).optional().default("TENANT"),
  referralCode: z.string().optional()
});

/** PS + 6 chars, checked for collision. */
async function generatePartnerCode(): Promise<string> {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "PS";
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const clash = await db.partnerProfile.findUnique({ where: { partnerCode: code }, select: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not generate a unique partner code");
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  // IP-based rate limit: 5 registrations per hour per IP.
  // Prevents account spam and phone-number enumeration.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`register:${ip}`, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();
  // Zod throws an error which is caught by withErrorHandler
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, message: parseResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, phone, password, role, referralCode } = parseResult.data;

  // Validate role
  const allowedRoles: AllowedRole[] = ["TENANT", "OWNER", "PARTNER"];
  const userRole: AllowedRole =
    allowedRoles.includes(role as AllowedRole) ? (role as AllowedRole) : "TENANT";

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });
  if (existingUser) {
    return NextResponse.json(
      { success: false, message: "An account with this phone number or email already exists" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(password, 10);

  if (userRole === "PARTNER") {
    const partnerCode = await generatePartnerCode();
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          phone,
          email: email.trim().toLowerCase(),
          passwordHash,
          role: userRole,
          isVerified: true,
        },
        select: { id: true },
      });

      const profile = await tx.partnerProfile.create({
        data: {
          userId: user.id,
          partnerCode,
          type: "FREELANCER",
          status: "PENDING",
        },
        select: { id: true },
      });

      await tx.partnerSetting.create({ data: { partnerId: profile.id } });
    });
  } else {
    let partnerId = undefined;
    
    if (userRole === "OWNER" && referralCode) {
      const partner = await db.partnerProfile.findUnique({
        where: { partnerCode: referralCode },
        select: { id: true }
      });
      if (partner) partnerId = partner.id;
    }

    await db.user.create({
      data: {
        name: name.trim(),
        phone,
        email: email.trim().toLowerCase(),
        passwordHash,
        role: userRole,
        isVerified: true,
        partnerId,
      },
    });
  }

  if (userRole === "PARTNER") {
    sendPartnerApplicationReceivedEmail(email.trim().toLowerCase(), name.trim()).catch((e) => {
      console.error("[PARTNER_APP_EMAIL_ERROR]", e);
    });
  } else {
    sendWelcomeEmail(email.trim().toLowerCase(), name.trim(), userRole, phone, password).catch((e) => {
      console.error("[WELCOME_EMAIL_ERROR]", e);
    });
  }

  sendAdminNewUserNotificationEmail(name.trim(), userRole, phone, email.trim().toLowerCase()).catch((e) => {
    console.error("[ADMIN_NOTIFY_EMAIL_ERROR]", e);
  });

  return NextResponse.json(
    { success: true, message: "Registration successful" },
    { status: 201 }
  );
});

