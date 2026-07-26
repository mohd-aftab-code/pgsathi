/**
 * lib/owner-credentials.ts
 * The login password a partner hands to an owner they registered.
 *
 * Shared by every place that creates or resets an owner account, so the rules
 * live once: /api/partner/owners, /api/partner/owners/[id] and /api/partner/pgs.
 */
import crypto from "crypto";

/**
 * Readable enough to be spoken over the phone or written on paper: no
 * characters that look alike (0/O, 1/l/I), one capital, four letters, three
 * digits — 8 characters, unambiguous.
 *
 * Generated fresh every time and only ever returned to the caller once; the
 * database stores the bcrypt hash, so a lost password has to be reissued rather
 * than looked up.
 */
export function generateOwnerPassword(): string {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (set: string, n: number) =>
    Array.from({ length: n }, () => set[crypto.randomInt(set.length)]).join("");
  return `${pick(upper, 1)}${pick(letters, 4)}${pick(digits, 3)}`;
}
