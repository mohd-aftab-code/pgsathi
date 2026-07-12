import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();

    const userId = parseInt(session.user.id);
    const existing = await db.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ success: false, message: "This email is already in use" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}
