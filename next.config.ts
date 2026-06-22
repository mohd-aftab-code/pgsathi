import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: "c:/Users/USER/Desktop/pgsathi",
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
