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
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
