/**
 * app/api/partner/profile/route.ts
 * PATCH — update the signed-in partner's own profile / payout / settings.
 * Only self-editable fields; status, code and approval are never touched here.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePartnerApi, logPartnerActivity } from "@/lib/partner-auth";
import { can, PERMISSIONS } from "@/lib/permissions";

export async function PATCH(req: NextRequest) {
  const ctx = await requirePartnerApi();
  if (!ctx) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (!(await can("PARTNER", PERMISSIONS.SETTINGS_MANAGE_OWN))) {
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const section = body.section as "profile" | "payout" | "settings";

  try {
    if (section === "profile") {
      const name = String(body.name ?? "").trim();
      if (name && name.length >= 2) {
        await db.user.update({ where: { id: ctx.userId }, data: { name } });
      }
      await db.partnerProfile.update({
        where: { id: ctx.partnerId },
        data: {
          company: body.company !== undefined ? String(body.company).trim() || null : undefined,
          city: body.city !== undefined ? String(body.city).trim() || null : undefined,
          address: body.address !== undefined ? String(body.address).trim() || null : undefined,
        },
      });
    } else if (section === "payout") {
      await db.partnerProfile.update({
        where: { id: ctx.partnerId },
        data: {
          panNumber: body.panNumber !== undefined ? String(body.panNumber).trim().toUpperCase() || null : undefined,
          bankName: body.bankName !== undefined ? String(body.bankName).trim() || null : undefined,
          bankAccountNo: body.bankAccountNo !== undefined ? String(body.bankAccountNo).replace(/\s/g, "") || null : undefined,
          bankIfsc: body.bankIfsc !== undefined ? String(body.bankIfsc).trim().toUpperCase() || null : undefined,
          upiId: body.upiId !== undefined ? String(body.upiId).trim() || null : undefined,
        },
      });
    } else if (section === "settings") {
      await db.partnerSetting.upsert({
        where: { partnerId: ctx.partnerId },
        create: {
          partnerId: ctx.partnerId,
          notifyInApp: body.notifyInApp ?? true,
          notifyEmail: body.notifyEmail ?? true,
          notifyWhatsapp: body.notifyWhatsapp ?? false,
        },
        update: {
          notifyInApp: body.notifyInApp,
          notifyEmail: body.notifyEmail,
          notifyWhatsapp: body.notifyWhatsapp,
        },
      });
    } else {
      return NextResponse.json({ success: false, message: "Invalid section" }, { status: 400 });
    }

    await logPartnerActivity(ctx.partnerId, `${section} update kiya`, { entity: "PartnerProfile" });
    return NextResponse.json({ success: true, message: "Save ho gaya" });
  } catch (error: any) {
    console.error("[PARTNER_PROFILE_PATCH]", error);
    return NextResponse.json({ success: false, message: "Save nahi hua" }, { status: 500 });
  }
}
