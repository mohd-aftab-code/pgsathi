/** Must stay in sync with the Prisma `UserRole` enum (prisma/schema.prisma).
 *  "MANAGER" is not a DB role — it is a session-only role for PgTeamMember logins. */
export type UserRole = "TENANT" | "OWNER" | "ADMIN" | "PARTNER";

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  isVerified: boolean;
  isActive: boolean;
  referralCode?: string | null;
  createdAt: string;
}

export interface UserSession {
  id: string; // The database ID (stringified for NextAuth)
  uuid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}
