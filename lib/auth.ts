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
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[DEBUG] authorize() called with:", { email: credentials?.email, phone: credentials?.phone });
        try {
          if (!credentials) return null;

          const email = credentials.email as string | undefined;
          const phone = credentials.phone as string | undefined;
          const password = credentials.password as string | undefined;

          if (!password) {
             throw new Error("Password is required");
          }

          // Login with Email & Password (Admin)
          if (email) {
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

          // Login with Phone & Password (User)
          if (phone) {
            const user = await db.user.findUnique({
              where: { phone: phone },
            });

            if (!user || !user.passwordHash) {
              throw new Error("Invalid phone number or password");
            }

            const isValid = await compare(password, user.passwordHash);

            if (!isValid) {
              throw new Error("Invalid phone number or password");
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
      if (user) {
        token.id = user.id;
        token.uuid = user.uuid;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.uuid = token.uuid as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
});
