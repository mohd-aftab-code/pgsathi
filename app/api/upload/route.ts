import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Only JPEG, PNG, WEBP, or AVIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, message: "File must be smaller than 8MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { url, publicId } = await uploadImage(buffer);

    return NextResponse.json({
      success: true,
      url,
      publicId
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
