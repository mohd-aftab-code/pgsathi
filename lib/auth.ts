import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "this-is-a-super-secret-key-for-next-auth-pgsathi-2026",
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  debug: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // For OTP
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        console.log("[DEBUG] authorize() called with:", credentials);
        try {
          if (!credentials) return null;

          const email = credentials.email as string | undefined;
          const password = credentials.password as string | undefined;
          const phone = credentials.phone as string | undefined;
          const otp = credentials.otp as string | undefined;

          // Login with Email & Password
          if (email && password) {
            const user = await db.user.findUnique({
              where: { email: email },
            });

            if (!user || !user.passwordHash) {
              throw new Error("Invalid email or password");
            }

            const isValid = await compare(password, user.passwordHash);

            if (!isValid) {
              throw new Error("Invalid email or password");
            }

            return {
              id: user.id.toString(),
              uuid: user.uuid,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
            };
          }

          // Login with OTP (Phone)
          if (phone && otp) {
            // Find valid OTP
            const otpRecord = await db.otpCode.findFirst({
              where: {
                phone: phone,
                code: otp,
                purpose: "login",
                isUsed: false,
                expiresAt: { gt: new Date() },
              },
            });

            if (!otpRecord) {
              console.log("[DEBUG] Invalid or expired OTP for phone:", phone);
              throw new Error("Invalid or expired OTP");
            }

            // Find User
            let user = await db.user.findUnique({
              where: { phone: phone },
            });

            if (!user) {
              // Auto-signup the user since OTP is verified
              user = await db.user.create({
                data: {
                  phone: phone,
                  name: `User_${phone.slice(-4)}`, // Default name
                  email: `user_${phone}@pgsathi.in`, // Placeholder email
                  role: "TENANT", // Default role
                  isVerified: true,
                }
              });
              console.log("[DEBUG] New user created:", user);
            } else {
              console.log("[DEBUG] Existing user found:", user);
            }

            // Mark OTP as used
            await db.otpCode.update({
              where: { id: otpRecord.id },
              data: { isUsed: true },
            });

            return {
              id: user.id.toString(),
              uuid: user.uuid,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
            };
          }

          return null;
        } catch (error) {
          console.error("[DEBUG] authorize() Error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("[DEBUG] jwt callback - token:", token, "user:", user);
      if (user) {
        token.id = user.id;
        token.uuid = user.uuid;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[DEBUG] session callback - session:", session, "token:", token);
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.uuid = token.uuid as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
});
