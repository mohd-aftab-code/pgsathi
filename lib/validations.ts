import { z } from "zod";

// ─────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["TENANT", "OWNER"]).default("TENANT"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  code: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["login", "register", "reset"]),
});

// ─────────────────────────────────────
// LISTING SCHEMAS
// ─────────────────────────────────────
export const createListingSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description too long"),
  pgType: z.enum([
    "SINGLE_ROOM",
    "DOUBLE_SHARING",
    "TRIPLE_SHARING",
    "DORMITORY",
    "STUDIO",
    "ENTIRE_FLAT",
  ]),
  genderAllowed: z.enum(["BOYS", "GIRLS", "COED"]),
  cityId: z.number().int().positive("City is required"),
  localityId: z.number().int().positive().optional(),
  address: z.string().min(10, "Full address is required").max(500),
  landmark: z.string().max(200).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priceMin: z.number().int().min(500, "Minimum price is ₹500"),
  priceMax: z.number().int().max(100000, "Maximum price is ₹1,00,000"),
  securityDeposit: z.number().int().optional(),
  foodIncluded: z.boolean().default(false),
  totalRooms: z.number().int().positive().optional(),
  availableRooms: z.number().int().min(0).optional(),
  amenityIds: z.array(z.number().int()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

// ─────────────────────────────────────
// SEARCH SCHEMAS
// ─────────────────────────────────────
export const searchSchema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  gender: z.enum(["BOYS", "GIRLS", "COED"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  pgType: z
    .enum([
      "SINGLE_ROOM",
      "DOUBLE_SHARING",
      "TRIPLE_SHARING",
      "DORMITORY",
      "STUDIO",
      "ENTIRE_FLAT",
    ])
    .optional(),
  amenities: z.array(z.string()).optional(),
  foodIncluded: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "rating"])
    .default("newest"),
});

// ─────────────────────────────────────
// LEAD (CONTACT) SCHEMA
// ─────────────────────────────────────
export const leadSchema = z.object({
  listingId: z.number().int().positive(),
  name: z.string().min(2, "Name required").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  email: z.string().email("Invalid email").optional(),
  message: z.string().max(500).optional(),
  source: z.enum(["WEBSITE", "WHATSAPP", "PHONE", "APP"]).default("WEBSITE"),
});

// ─────────────────────────────────────
// REVIEW SCHEMA
// ─────────────────────────────────────
export const reviewSchema = z.object({
  listingId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment too short").max(1000).optional(),
});

// ─────────────────────────────────────
// PAYMENT SCHEMAS
// ─────────────────────────────────────
export const createOrderSchema = z.object({
  planId: z.number().int().positive().optional(),
  boostType: z.enum(["SPOTLIGHT", "FEATURED", "HOMEPAGE", "WHATSAPP_BLAST"]).optional(),
  listingId: z.number().int().positive().optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

// Types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
