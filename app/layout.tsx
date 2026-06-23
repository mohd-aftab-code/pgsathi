import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

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
    default: "PGSathi — Zero Brokerage PG in Delhi NCR, Noida & Gurgaon",
    template: "%s | PGSathi",
  },
  description:
    "India's #1 verified platform for finding zero brokerage PGs, hostels, and rooms for rent directly from owners. Discover premium Boys, Girls, and Co-ed PGs in Delhi, Noida, and Gurgaon.",
  keywords: [
    "Zero Brokerage PG in Noida",
    "Direct Owner Boys PG in Delhi NCR",
    "Verified Girls PG in Gurgaon without broker",
    "Premium PG with Food in Knowledge Park Noida",
    "Affordable PG in Mukherjee Nagar",
    "Best PG in Sector 62 Noida",
    "Paying Guest in South Delhi",
    "Rooms for rent in Gurgaon DLF",
    "PG for students in North Campus",
    "PGSathi",
  ],
  authors: [{ name: "PGSathi" }],
  creator: "PGSathi",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pgsathi.in",
    siteName: "PGSathi",
    title: "PGSathi — Zero Brokerage PGs in NCR",
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
    title: "PGSathi — Verified PGs in Delhi NCR",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://pgsathi.in",
  },
  verification: {
    google: "ZaMEO4rMht0Z5dIPt2AeWfLWDCu25rMA8baxz77ON28",
  }
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "PGSathi",
    "image": "https://pgsathi.in/images/logo.jpeg",
    "description": "India's #1 verified platform for finding zero brokerage PGs directly from owners. Operating primarily in Delhi NCR.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sector 62",
      "addressLocality": "Noida",
      "addressRegion": "UP",
      "postalCode": "201309",
      "addressCountry": "IN"
    },
    "telephone": "+919696110243",
    "email": "pgsathi@gmail.com",
    "url": "https://pgsathi.in"
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${notoDevanagari.variable}`}
    >
      <head>
        <meta name="google-site-verification" content="ZaMEO4rMht0Z5dIPt2AeWfLWDCu25rMA8baxz77ON28" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-neutral-50 antialiased">
        {children}
      </body>
    </html>
  );
}
