import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

type AllowedRole = "TENANT" | "OWNER";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, password, role } = body as {
      name?: string;
      phone?: string;
      password?: string;
      role?: string;
    };

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Name, phone, and password are required" },
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
    const allowedRoles: AllowedRole[] = ["TENANT", "OWNER"];
    const userRole: AllowedRole =
      allowedRoles.includes(role as AllowedRole) ? (role as AllowedRole) : "TENANT";

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this phone number already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    await db.user.create({
      data: {
        name:         name.trim(),
        phone,
        email:        `${userRole.toLowerCase()}_${phone}@pgsathi.in`,
        passwordHash,
        role:         userRole,
        isVerified:   true,
      },
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
