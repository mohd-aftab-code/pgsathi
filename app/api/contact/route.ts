import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendContactEnquiryEmail } from "@/lib/email";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limit: 5 contact enquiries per 5 minutes per IP
    const rateCheck = await checkRateLimit(`contact-form:${ip}`, 5, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many enquiries submitted. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { firstName, lastName, name, email, phone, subject, message } = body;

    // Resolve name
    const resolvedName = (name || `${firstName || ""} ${lastName || ""}`).trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    const cleanSubject = (subject || "General Inquiry").trim();
    const cleanMessage = (message || "").trim();

    // Validation
    if (!resolvedName || resolvedName.length < 2) {
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json(
        { error: "Please enter a message of at least 5 characters." },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) || null;

    // 1. Save in database (contact_enquiries table)
    const enquiry = await db.contactEnquiry.create({
      data: {
        name: resolvedName,
        email: cleanEmail,
        phone: cleanPhone || null,
        subject: cleanSubject,
        message: cleanMessage,
        ipAddress: ip,
        userAgent,
        status: "PENDING",
        isRead: false,
      },
    });

    console.log(`[Contact API] Saved enquiry #${enquiry.id} from ${resolvedName} (${cleanEmail})`);

    // 2. Dispatch email to pgsathi.support@gmail.com asynchronously
    sendContactEnquiryEmail({
      enquiryId: enquiry.id,
      name: resolvedName,
      email: cleanEmail,
      phone: cleanPhone || null,
      subject: cleanSubject,
      message: cleanMessage,
      createdAt: format(enquiry.createdAt, "dd MMMM yyyy, hh:mm a"),
      ipAddress: ip,
    }).catch((emailErr) => {
      console.error("[Contact API] Failed to send enquiry email:", emailErr);
    });

    // 3. Create in-app notification for Super Admins
    try {
      const admins = await db.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((adm) => ({
            userId: adm.id,
            type: "SYSTEM",
            title: `New Enquiry: ${cleanSubject}`,
            message: `${resolvedName} (${cleanEmail}): ${cleanMessage.slice(0, 100)}...`,
            link: `/dashboard/admin/enquiries`,
          })),
        });
      }
    } catch (notifErr) {
      console.error("[Contact API] Error creating admin notifications:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been received! Our support team will get back to you shortly.",
      enquiryId: enquiry.id,
    });
  } catch (error: any) {
    console.error("[Contact API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong while submitting your enquiry. Please try again later." },
      { status: 500 }
    );
  }
}
