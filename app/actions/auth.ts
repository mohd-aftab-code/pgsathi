"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginWithOTP(phone: string, otp: string) {
  try {
    await signIn("credentials", {
      phone,
      otp,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid or expired OTP." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}
