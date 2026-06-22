import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to Indian format: ₹4,500
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format price range: ₹4,500 – ₹7,000
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

// Generate URL-friendly slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate unique PG listing slug: "boys-pg-near-iit-kota-abc123"
export function generateListingSlug(title: string, uuid: string): string {
  const base = slugify(title);
  const suffix = uuid.slice(-6);
  return `${base}-${suffix}`;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// Format relative time: "2 days ago"
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "अभी";
  if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;
  if (diffHours < 24) return `${diffHours} घंटे पहले`;
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  return date.toLocaleDateString("en-IN");
}

// Get WhatsApp link for owner contact
export function getWhatsAppLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  const cleaned = phone.replace(/\D/g, "");
  const withCountryCode = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  return `https://wa.me/${withCountryCode}?text=${encoded}`;
}

// Validate Indian phone number
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
}

// Generate OTP (6-digit)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate discount percentage
export function calculateDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

// Convert to Razorpay amount (paise)
export function toRazorpayAmount(rupees: number): number {
  return rupees * 100;
}

// Convert from Razorpay amount (paise to rupees)
export function fromRazorpayAmount(paise: number): number {
  return paise / 100;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
