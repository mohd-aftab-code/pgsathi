import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { InstallPWA } from "@/components/common/InstallPWA";
import { MobileAppNav } from "@/components/common/MobileAppNav";
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
    default: "PGSathi: India's #1 PG Platform & Management Software",
    template: "%s | PGSathi",
  },
  description:
    "India's most trusted platform. Find 100% verified zero brokerage PGs, get direct tenant leads, use free PG management software, or earn as a partner.",
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
    title: "PGSathi: India's #1 PG Platform & Management Software",
    description:
      "India's most trusted platform. Find 100% verified zero brokerage PGs, get direct tenant leads, use free PG management software, or earn as a partner.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PGSathi: India's #1 PG Platform & Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGSathi: India's #1 PG Platform & Management Software",
    description: "Find verified PGs, direct tenant leads, free PG management software, and partner earning opportunities.",
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
    "url": "https://pgsathi.in",
    "logo": "https://pgsathi.in/mobileaapicon.png",
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
        {/* Applies the saved Partner Portal theme before paint, so there is no
            light/dark flash. Self-guards on the /partner path, so it is a no-op
            for the rest of the site — which is light-only. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
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
        <InstallPWA />
        {children}
        <MobileAppNav session={session} />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
