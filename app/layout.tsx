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
    default: "PGSathi — Apna PG, Apna Sathi | Best PG Finder in India",
    template: "%s | PGSathi",
  },
  description:
    "India ka sabse trusted PG dhundne ka platform. Verified PG listings for boys, girls and co-ed in Kota, Jaipur, Pune, Indore and more cities. No broker fees.",
  keywords: [
    "PG in Kota",
    "paying guest near me",
    "PG for boys",
    "PG for girls",
    "student accommodation",
    "PG rooms",
    "PG without broker",
    "affordable PG",
    "hostel rooms",
    "PG Sathi",
  ],
  authors: [{ name: "PGSathi" }],
  creator: "PGSathi",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pgsathi.in",
    siteName: "PGSathi",
    title: "PGSathi — Apna PG, Apna Sathi",
    description:
      "India ka sabse trusted PG dhundne ka platform. Verified listings, no broker fees.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PGSathi — Find Your Perfect PG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGSathi — Apna PG, Apna Sathi",
    description: "Find verified PGs in your city. No broker. No hassle.",
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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${notoDevanagari.variable}`}
    >
      <body className="min-h-screen bg-neutral-50 antialiased">
        {children}
      </body>
    </html>
  );
}
