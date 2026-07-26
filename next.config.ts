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
          }
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
