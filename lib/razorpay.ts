import Razorpay from "razorpay";
import crypto from "crypto";

let cachedClient: Razorpay | null = null;

/**
 * Lazily creates the Razorpay client on first use. Must NOT run at module
 * load time — the Razorpay SDK throws in its constructor if key_id is
 * empty, which would crash the build/boot when env vars aren't present
 * at that stage (e.g. Vercel's page-data collection step).
 */
export function getRazorpayClient(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured");
  }
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return cachedClient;
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
