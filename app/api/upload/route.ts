import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    // Since we don't have real Cloudinary credentials active, we will return a mock response
    // In a real scenario, we would use Cloudinary SDK to upload the file buffer
    
    // MOCK RESPONSE
    const mockUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";

    return NextResponse.json({ 
      success: true, 
      url: mockUrl,
      publicId: `mock_${Date.now()}`
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
