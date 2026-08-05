/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS — force HTTPS for 1 year after first visit; includeSubDomains
          // covers partner.pgsathi.in etc. Only safe once SSL is confirmed permanent.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Content Security Policy — blocks XSS by allowlisting sources.
          // 'unsafe-inline' in style-src is needed for Tailwind's runtime styles.
          // Update img-src / connect-src if you add new third-party services.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // scripts: self + inline (Next.js hydration) + known CDNs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://maps.googleapis.com https://www.googletagmanager.com",
              // styles: self + inline (Tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
              // fonts
              "font-src 'self' https://fonts.gstatic.com",
              // images: self + Cloudinary + Google avatars + maps + misc
              //
              // The OpenStreetMap tile hosts are required — without them every
              // tile request on the listing map is blocked and the map renders
              // as a blank grey box with a broken marker. Both the bare host and
              // the a/b/c subdomains are listed because Leaflet's {s} template
              // rotates between them.
              "img-src 'self' blob: data: https://res.cloudinary.com https://*.googleusercontent.com https://streetviewpixels-pa.googleapis.com https://upload.wikimedia.org https://i.pravatar.cc https://images.unsplash.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com",
              // API calls: self + Razorpay + Mapbox
              "connect-src 'self' https://api.razorpay.com https://api.mapbox.com https://*.mapbox.com https://maps.googleapis.com",
              // iframes: Razorpay checkout modal
              "frame-src https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/pg-in-:city',
        destination: '/pg-in-city?city=:city',
      },
      {
        source: '/:category(boys|girls|coed)-pg-in-:city',
        destination: '/category-pg-in-city?category=:category&city=:city',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/dashboard/owner/manage',
        destination: '/dashboard/manager',
        permanent: true,
      },
      // The owner keeps a read-only bed report at /dashboard/owner/inventory, but
      // room/bed ENTRY moved into PG Manager so there is only one place to add
      // them. Old per-property entry links land there.
      {
        source: '/dashboard/owner/inventory/:id',
        destination: '/dashboard/manager/rooms',
        permanent: true,
      },
      {
        source: '/dashboard/owner/manage/:path*',
        destination: '/dashboard/manager/:path*',
        permanent: true,
      },
      // There were two partner landing pages. /partner-program sat inside the
      // (main) group, so it rendered the site Navbar and its CTAs pointed at
      // /register — a visitor who came to join as a partner landed on the
      // three-role tenant/owner form instead. /partner is the real one: partner
      // header, partner CTAs. Old links and indexed URLs land there now.
      {
        source: '/partner-program',
        destination: '/partner',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "streetviewpixels-pa.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // pdfkit loads its .afm font-metric files from its own package directory at
  // runtime; bundling it breaks those paths and every PDF export fails. exceljs
  // is listed for the same reason (large Node-only dependency).
  serverExternalPackages: ["@prisma/client", "prisma", "pdfkit", "exceljs"],
};

export default nextConfig;
