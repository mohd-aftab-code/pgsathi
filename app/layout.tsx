import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { InstallPWA } from "@/components/common/InstallPWA";
import { MobileAppNav } from "@/components/common/MobileAppNav";
import { ToasterProvider } from "@/components/common/ToasterProvider";
import { themeInitScript } from "@/components/partner/ThemeToggle";
import { auth } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pgsathi.in"),
  title: {
    default: "PGSathi: India's #1 PG List Platform & Management Software",
    template: "%s | PGSathi",
  },
  description:
    "India's #1 PG list platform. Find 100% verified zero brokerage PGs, get direct tenant leads, use free PG management software, or earn as a partner.",
  alternates: {
    canonical: "https://pgsathi.in",
    languages: {
      "en-IN": "https://pgsathi.in",
    },
  },
  authors: [{ name: "PGSathi" }],
  creator: "PGSathi",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pgsathi.in",
    siteName: "PGSathi",
    title: "PGSathi: India's #1 PG List Platform & Management Software",
    description:
      "India's #1 PG list platform. Find 100% verified zero brokerage PGs, get direct tenant leads, use free PG management software, or earn as a partner.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PGSathi: India's #1 PG List Platform & Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGSathi: India's #1 PG List Platform & Management Software",
    description:
      "India's #1 PG list platform. Find verified PGs, direct tenant leads, free PG management software, and partner earning opportunities.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/mobileaapicon.png",
    shortcut: "/mobileaapicon.png",
    apple: "/mobileaapicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PGSathi",
    "alternateName": ["PG Sathi", "PGSathi Platform", "PGSathi PG List & Management Software"],
    "url": "https://pgsathi.in",
    "logo": "https://pgsathi.in/mobileaapicon.png",
    "description": "India's dedicated 3-in-1 ecosystem for tenants (zero brokerage verified PGs), PG owners (free listings, direct WhatsApp leads & cloud CRM), and affiliate partners (10% recurring commission).",
    "knowsAbout": [
      "Zero Brokerage PG Accommodation for Tenants",
      "Hostels and Co-living Spaces for Students and Professionals",
      "Direct PG Owner Contact without Middlemen",
      "Free PG Listing Platform for Owners",
      "Cloud PG Management Software & Hostel CRM",
      "Bed-Level Vacancy Tracking",
      "1-Click WhatsApp Rent Reminders with UPI",
      "Paperless Digital Tenant KYC",
      "Hostel Mess & Meal Scheduling",
      "PGSathi Partner Programme & Recurring Affiliate Commission"
    ],
    "sameAs": [
      "https://www.facebook.com/pgsathi",
      "https://www.instagram.com/pgsathi",
      "https://www.linkedin.com/company/pgsathi"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9696110243",
      "contactType": "customer service",
      "email": "pgsathi.support@gmail.com",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PGSathi PG Management Software & CRM",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
    "url": "https://pgsathi.in/pg-management-software",
    "description": "Complete cloud-based PG and hostel management software with bed-level inventory tracking, 1-click WhatsApp rent collection with UPI, digital Aadhaar KYC, and meal mess management.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Free Starter Tier with lifetime free listing and 15-day trial of PG Manager CRM"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PGSathi",
    "alternateName": "PG Sathi",
    "url": "https://pgsathi.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pgsathi.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "PGSathi",
    "image": "https://pgsathi.in/images/logo.jpeg",
    "description": "India's #1 verified platform for finding zero brokerage PGs directly from owners. Operating across Metros, Tier 2, and Tier 3 cities in India.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sector 62",
      "addressLocality": "Noida",
      "addressRegion": "UP",
      "postalCode": "201309",
      "addressCountry": "IN"
    },
    "telephone": "+919696110243",
    "email": "pgsathi.support@gmail.com",
    "url": "https://pgsathi.in"
  };

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${plusJakarta.variable} ${notoDevanagari.variable}`}
    >
      <GoogleTagManager gtmId="GTM-PF5NWQMS" />
      <head>
        <meta name="google-site-verification" content="ZaMEO4rMht0Z5dlPt2AeWfLWDCu25rMA8baxz770N28" />
        {/* Applies the saved Partner Portal theme before paint, so there is no
            light/dark flash. Self-guards on the /partner path, so it is a no-op
            for the rest of the site — which is light-only. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (${process.env.NODE_ENV === "production" ? "true" : "false"}) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                } else {
                  // Dev mode: unregister any previously-installed SW so a stale
                  // fetch handler can't intercept requests while the dev server restarts.
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(r) { r.unregister(); });
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-neutral-50 antialiased">
        <ToasterProvider />
        <InstallPWA />
        {children}
        <MobileAppNav session={session} />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
