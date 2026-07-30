import jwt from 'jsonwebtoken';

// Using a dedicated secret for mobile tokens, or fallback to the NEXTAUTH_SECRET
const JWT_SECRET = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-super-secret-key';

export interface MobileJWTPayload {
  userId: number;
  phone: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a JSON Web Token for the mobile app.
 * Valid for 30 days.
 */
export function signMobileToken(payload: Omit<MobileJWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verifies a mobile JSON Web Token.
 * Returns the decoded payload or null if invalid.
 */
export function verifyMobileToken(token: string): MobileJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
