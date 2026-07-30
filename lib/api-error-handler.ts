import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export function withErrorHandler(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, message: error.issues[0]?.message || "Validation Error" },
          { status: 400 }
        );
      }
      
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error);
      
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
