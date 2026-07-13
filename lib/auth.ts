import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

// NextAuth v5 expects AUTH_SECRET, but this project's Vercel env still has the
// v4-era NEXTAUTH_SECRET name (see proxy.ts, which already falls back the same way).
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET (or NEXTAUTH_SECRET) environment variable is not set");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:     { label: "Email",     type: "email" },
        phone:     { label: "Phone",     type: "text" },
        password:  { label: "Password",  type: "password" },
        isManager: { label: "Manager",   type: "text" },
        impersonateUserId: { label: "Impersonate", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null;

          const email     = credentials.email     as string | undefined;
          const phone     = credentials.phone     as string | undefined;
          const password  = credentials.password  as string | undefined;
          const isManager = credentials.isManager as string | undefined;
          const impersonateUserId = credentials.impersonateUserId as string | undefined;

          if (!password) throw new Error("Password is required");

          // ── IMPERSONATION (Super Admin Only) ──────────────────────
          if (impersonateUserId && email) {
            // First, verify the admin's credentials
            const adminUser = await db.user.findUnique({ where: { email } });
            if (!adminUser || !adminUser.passwordHash || adminUser.role !== "ADMIN") {
              throw new Error("Unauthorized to impersonate");
            }

            const isValidAdmin = await compare(password, adminUser.passwordHash);
            if (!isValidAdmin) throw new Error("Invalid admin credentials");

            // Fetch the target user to impersonate
            const targetUser = await db.user.findUnique({ where: { id: parseInt(impersonateUserId) } });
            if (!targetUser) throw new Error("Target user not found");

            return {
              id:     targetUser.id.toString(),
              uuid:   targetUser.uuid,
              name:   targetUser.name,
              email:  targetUser.email,
              role:   targetUser.role,
              avatar: targetUser.avatar,
            };
          }

          // ── MANAGER LOGIN ─────────────────────────────────────────
          if (isManager === "true" && email) {
            const member = await db.pgTeamMember.findUnique({
              where: { email: email.toLowerCase().trim() },
              include: {
                owner: { select: { id: true, name: true, isActive: true } },
              },
            });

            if (!member || !member.active) {
              throw new Error("Manager account not found or deactivated");
            }

            const isValid = await compare(password, member.passwordHash);
            if (!isValid) throw new Error("Invalid manager credentials");

            return {
              id:        `manager:${member.id}`,
              uuid:      `mgr-${member.id}`,
              name:      member.name,
              email:     member.email,
              role:      "MANAGER" as any,
              avatar:    null,
              // extra fields stored in token
              ownerId:   member.ownerId,
              managerRole: member.role,
              listingIds:  member.listingIds ?? "[]",
            };
          }

          // ── EMAIL LOGIN (Admin / Owner by email) ──────────────────
          if (email && !isManager) {
            const user = await db.user.findUnique({ where: { email } });

            if (!user || !user.passwordHash) {
              throw new Error("Invalid email or password");
            }

            const isValid = await compare(password, user.passwordHash);
            if (!isValid) throw new Error("Invalid email or password");

            return {
              id:     user.id.toString(),
              uuid:   user.uuid,
              name:   user.name,
              email:  user.email,
              role:   user.role,
              avatar: user.avatar,
            };
          }

          // ── PHONE LOGIN (User / Tenant / Owner by phone) ──────────
          if (phone) {
            const user = await db.user.findUnique({ where: { phone } });

            if (!user || !user.passwordHash) {
              throw new Error("Invalid phone number or password");
            }

            const isValid = await compare(password, user.passwordHash);
            if (!isValid) throw new Error("Invalid phone number or password");

            return {
              id:     user.id.toString(),
              uuid:   user.uuid,
              name:   user.name,
              email:  user.email,
              role:   user.role,
              avatar: user.avatar,
            };
          }

          return null;
        } catch (error) {
          console.error("[AUTH] authorize() Error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id         = user.id;
        token.uuid       = (user as any).uuid;
        token.role       = (user as any).role;
        // Manager-specific
        if ((user as any).ownerId) {
          token.ownerId      = (user as any).ownerId;
          token.managerRole  = (user as any).managerRole;
          token.listingIds   = (user as any).listingIds;
          token.isManager    = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id as string;
        session.user.uuid = token.uuid as string;
        session.user.role = token.role as any;
        if (token.isManager) {
          (session.user as any).ownerId     = token.ownerId;
          (session.user as any).managerRole = token.managerRole;
          (session.user as any).listingIds  = token.listingIds;
          (session.user as any).isManager   = true;
        }
      }
      return session;
    },
  },
});
