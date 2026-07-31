import { DefaultSession, User as DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { UserRole, SessionRole } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      uuid: string;
      role: SessionRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    uuid: string;
    role: SessionRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    uuid: string;
    role: SessionRole;
    /** Set on accounts a partner created; forces a password change at the edge. */
    mustChangePassword?: boolean;
  }
}
