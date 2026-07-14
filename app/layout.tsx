import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

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
    default: "PGSathi — Zero Brokerage PG in Metro, Tier 2 & Tier 3 Cities",
    template: "%s | PGSathi",
  },
  description:
    "India's #1 verified platform for finding zero brokerage PGs, hostels, and rooms for rent directly from owners. Discover premium Boys, Girls, and Co-ed PGs across India's Metros and Tier 2/Tier 3 cities.",
  alternates: {
    canonical: "https://pgsathi.in",
  },
  authors: [{ name: "PGSathi" }],
  creator: "PGSathi",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pgsathi.in",
    siteName: "PGSathi",
    title: "PGSathi — Zero Brokerage PGs in India",
    description:
      "Find 100% verified PGs in Delhi, Noida, and Gurgaon without paying 1 month's rent as brokerage. Connect directly with owners.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PGSathi — Find Your Perfect Zero Brokerage PG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGSathi — Verified PGs in India",
    description: "Connect directly with owners. No brokers. No hidden fees.",
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
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PGSathi",
    "url": "https://pgsathi.in",
    "logo": "https://pgsathi.in/icon.png",
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PGSathi",
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
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${notoDevanagari.variable}`}
    >
      <GoogleTagManager gtmId="GTM-PF5NWQMS" />
      <head>
        <meta name="google-site-verification" content="ZaMEO4rMht0Z5dlPt2AeWfLWDCu25rMA8baxz770N28" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-neutral-50 antialiased">
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
