/**
 * app/r/[code]/route.ts
 * The short referral link: pgsathi.in/r/PSAB12CD
 *
 * Exists for three reasons the long `/register?ref=` URL could not serve:
 *   • it is short enough to read off a poster, a visiting card or a QR code;
 *   • it runs on Node, so this is where a click can actually be recorded — the
 *     edge proxy that sets the cookie has no database;
 *   • it gives the funnel its first step. Without a click row, "18 signups" has
 *     no denominator and partner quality cannot be compared.
 *
 * The cookie is set here as well as in `proxy.ts`, because a visitor who lands
 * here and then wanders off to browse listings must still carry the code when
 * they eventually register.
 */
import { NextRequest, NextResponse } from "next/server";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, normalizeCode, recordReferralClick } from "@/lib/referral";

export const runtime = "nodejs";
// Every open is a distinct click; caching this would silently collapse them.
export const dynamic = "force-dynamic";

/** Only same-origin paths — never redirect to an attacker-supplied host. */
function safeDestination(raw: string | null): string {
  if (!raw) return "/register";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/register";
  return raw.slice(0, 200);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode);
  const { searchParams } = new URL(req.url);

  const destination = safeDestination(searchParams.get("to"));
  const target = new URL(destination, req.url);

  if (!code) {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  // Carried through so the register page can greet the visitor by referrer name
  // and pre-select the OWNER role, exactly as the long link used to.
  target.searchParams.set("ref", code);

  await recordReferralClick({
    code,
    landingPath: destination,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
    utmSource: searchParams.get("utm_source"),
    utmMedium: searchParams.get("utm_medium"),
    utmCampaign: searchParams.get("utm_campaign"),
  });

  const res = NextResponse.redirect(target);
  res.cookies.set(REFERRAL_COOKIE, code, {
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
