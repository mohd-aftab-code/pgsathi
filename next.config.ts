/** @type {import('next').NextConfig} */
const nextConfig = {
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
