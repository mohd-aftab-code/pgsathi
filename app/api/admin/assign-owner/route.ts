import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { sendOwnerInviteEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // Check if user is ADMIN
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { listingId, name, email, phone } = await req.json();

    if (!listingId || !name || !email || !phone) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) }
    });

    if (!listing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    let tempPass = "";
    let isNewUser = false;

    if (!user) {
      // User doesn't exist, create a new one
      tempPass = `PgSathi@${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedPassword = await hash(tempPass, 10);

      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          passwordHash: hashedPassword,
          role: "OWNER",
          isVerified: true, // Auto verify since admin is creating it
        }
      });
      isNewUser = true;
    } else {
      // User exists, make sure they are an OWNER
      if (user.role === "TENANT") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "OWNER" }
        });
      }
    }

    // Assign the listing to this user
    await prisma.listing.update({
      where: { id: listing.id },
      data: { ownerId: user.id }
    });

    // Send Email
    if (isNewUser) {
      await sendOwnerInviteEmail(
        user.email,
        user.name,
        listing.title,
        user.email,
        tempPass
      );
    } else {
      // Send a different email or same email without password if they already exist
      // Since sendOwnerInviteEmail requires a password, we can just say "Use your existing password"
      await sendOwnerInviteEmail(
        user.email,
        user.name,
        listing.title,
        user.email,
        "*** (Your Existing Password) ***"
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Owner assigned successfully and email sent.",
      isNewUser
    });

  } catch (error: any) {
    console.error("Assign Owner Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
