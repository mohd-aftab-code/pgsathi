import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

type AllowedRole = "TENANT" | "OWNER" | "PARTNER";

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

export async function POST(req: NextRequest) {
  try {
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
    const { name, email, phone, password, role } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, phone, and password are required" },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

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
      await db.user.create({
        data: {
          name: name.trim(),
          phone,
          email: email.trim().toLowerCase(),
          passwordHash,
          role: userRole,
          isVerified: true,
        },
      });
    }

    sendWelcomeEmail(email.trim().toLowerCase(), name.trim(), userRole).catch((e) => {
      console.error("[WELCOME_EMAIL_ERROR]", e);
    });

    return NextResponse.json(
      { success: true, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

