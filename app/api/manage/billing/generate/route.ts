/**
 * app/api/manage/billing/generate/route.ts
 * POST — Auto-generate monthly rent bills for all active tenants.
 * Safe to call multiple times — uses upsert (@@unique[tenantId, forMonth]).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManageContext, logPgAudit } from "@/lib/manage-auth";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getManageContext();
    if (!ctx || !ctx.hasPaidPlan) return NextResponse.json({ success: false, message: "Upgrade required" }, { status: 403 });

    const { month, listingId } = await req.json();
    const forMonth = month ?? currentMonth();

    const where: any = { ownerId: ctx.userId, status: "ACTIVE", deletedAt: null };
    if (listingId) where.listingId = parseInt(listingId);

    const tenants = await db.pgTenant.findMany({ where });
    if (tenants.length === 0) {
      return NextResponse.json({ success: true, message: "No active tenants found", created: 0 });
    }

    // Determine due date: 5th of the given month (or per tenant's rentDueDay)
    const [yr, mo] = forMonth.split("-").map(Number);

    let created = 0;
    let skipped = 0;

    await Promise.all(
      tenants.map(async (t) => {
        const dueDate = new Date(yr, mo - 1, t.rentDueDay);
        const billCount = await db.pgRentBill.count({ where: { ownerId: ctx.userId } });
        const billNo = `BILL-${forMonth.replace("-", "")}-${String(billCount + 1).padStart(4, "0")}`;

        try {
          await db.pgRentBill.upsert({
            where:  { tenantId_forMonth: { tenantId: t.id, forMonth } },
            update: {},  // Do NOT overwrite an existing bill
            create: {
              ownerId:     ctx.userId,
              tenantId:    t.id,
              forMonth,
              rentAmount:  t.monthlyRent,
              electricity: 0,
              otherAmount: 0,
              lateFee:     0,
              dueDate,
              billNo,
            },
          });
          created++;
        } catch {
          skipped++;
        }
      })
    );

    await logPgAudit(ctx.userId, ctx.name, `Generated ${created} rent bills for ${forMonth}`, "PgRentBill");
    return NextResponse.json({ success: true, message: `${created} bills generated, ${skipped} already existed`, created, skipped });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
