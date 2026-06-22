export type UserRole = "TENANT" | "OWNER" | "ADMIN";

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
