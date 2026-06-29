import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "Name, phone, and password are required" },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { message: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        phone,
        email: `user_${phone}@pgsathi.in`, // Placeholder email to satisfy unique constraint if required
        passwordHash,
        role: "TENANT",
        isVerified: true,
      },
    });

    return NextResponse.json(
      { message: "Registration successful", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
