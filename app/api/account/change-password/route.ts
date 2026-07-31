/**
 * app/api/account/change-password/route.ts
 * POST — the signed-in user sets a new password.
 *
 * This is what releases the `mustChangePassword` lock on accounts a partner
 * created and handed over. The current password is still required: the flag is
 * about removing the partner's copy of the credential, not about letting anyone
 * with a hijacked session rewrite it.
 */
import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`pwchange:${userId}`, 5, 900);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, message: "Bahut zyada koshishein. Thodi der baad try karein." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (newPassword.length < 6) {
    return NextResponse.json({ success: false, message: "Naya password kam se kam 6 characters ka ho" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, mustChangePassword: true },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ success: false, message: "Is account par password login nahi hai" }, { status: 400 });
  }

  const ok = await compare(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ success: false, message: "Purana password galat hai" }, { status: 400 });
  }
  if (await compare(newPassword, user.passwordHash)) {
    return NextResponse.json(
      { success: false, message: "Naya password purane se alag hona chahiye" },
      { status: 400 },
    );
  }

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hash(newPassword, 10), mustChangePassword: false },
  });

  return NextResponse.json({ success: true, message: "Password badal gaya" });
}
