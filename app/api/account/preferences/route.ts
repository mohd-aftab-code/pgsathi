import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Narrow, owner-only preference update. Only these explicit boolean flags are writable —
// we never spread the request body into db.user.update (avoids mass-assignment).
const schema = z
  .object({
    messMenuEnabled: z.boolean().optional(),
    expensesEnabled: z.boolean().optional(),
  })
  .refine((d) => d.messMenuEnabled !== undefined || d.expensesEnabled !== undefined, {
    message: "No preference provided",
  });

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Owner-level setting — manager sub-accounts (id "manager:<n>") and non-owners can't change it.
    const isManager = (session.user as any).isManager;
    if (isManager || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const data: { messMenuEnabled?: boolean; expensesEnabled?: boolean } = {};
    if (parsed.data.messMenuEnabled !== undefined) data.messMenuEnabled = parsed.data.messMenuEnabled;
    if (parsed.data.expensesEnabled !== undefined) data.expensesEnabled = parsed.data.expensesEnabled;

    await db.user.update({ where: { id: userId }, data });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Update Preferences Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update preferences" }, { status: 500 });
  }
}
