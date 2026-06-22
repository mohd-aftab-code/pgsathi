export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number;          // monthly price in ₹
  yearlyPrice: number;    // yearly price in ₹ (total)
  maxListings: number;    // -1 = unlimited
  maxPhotos: number;
  popular?: boolean;
  features: PlanFeature[];
  razorpayPlanId?: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    slug: "starter",
    name: "Starter",
    price: 0,
    yearlyPrice: 0,
    maxListings: 1,
    maxPhotos: 5,
    features: [
      { text: "1 PG Listing", included: true },
      { text: "5 Photos per listing", included: true },
      { text: "30 days validity", included: true },
      { text: "WhatsApp leads", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "basic",
    slug: "basic",
    name: "Basic",
    price: 349,
    yearlyPrice: 2999,
    maxListings: 5,
    maxPhotos: 10,
    features: [
      { text: "5 PG Listings", included: true },
      { text: "10 Photos per listing", included: true },
      { text: "WhatsApp lead alerts", included: true },
      { text: "Basic analytics", included: true },
      { text: "Priority support", included: false },
      { text: "Featured badge", included: false },
    ],
  },
  {
    id: "growth",
    slug: "growth",
    name: "Growth",
    price: 699,
    yearlyPrice: 5999,
    maxListings: 20,
    maxPhotos: 20,
    popular: true,
    features: [
      { text: "20 PG Listings", included: true },
      { text: "20 Photos per listing", included: true },
      { text: "WhatsApp + Email lead alerts", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Featured badge", included: false },
    ],
  },
  {
    id: "pro",
    slug: "pro",
    name: "Pro",
    price: 1799,
    yearlyPrice: 14999,
    maxListings: -1,
    maxPhotos: 30,
    features: [
      { text: "Unlimited Listings", included: true },
      { text: "30 Photos per listing", included: true },
      { text: "All notification channels", included: true },
      { text: "Full analytics + export", included: true },
      { text: "Priority support", included: true },
      { text: "Featured badge (free)", included: true },
    ],
  },
];

export const BOOST_OPTIONS = [
  {
    type: "SPOTLIGHT" as const,
    name: "Spotlight Boost",
    description: "Top of city search results",
    price: 149,
    duration: 7,
    icon: "Zap",
  },
  {
    type: "FEATURED" as const,
    name: "Featured Badge",
    description: "Featured label + priority placement",
    price: 299,
    duration: 30,
    icon: "Star",
  },
  {
    type: "HOMEPAGE" as const,
    name: "City Homepage Banner",
    description: "Shown on city landing page hero",
    price: 499,
    duration: 7,
    icon: "Layout",
  },
  {
    type: "WHATSAPP_BLAST" as const,
    name: "WhatsApp Blast",
    description: "Sent to 1000 local searchers",
    price: 249,
    duration: 1,
    icon: "MessageCircle",
  },
];

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug);
}

export function getPlanSavings(plan: Plan): number {
  const monthlyTotal = plan.price * 12;
  return monthlyTotal - plan.yearlyPrice;
}
