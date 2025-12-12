import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      // You will likely need these later for product images too:
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
    ],
  },
  reactCompiler: true,

};

export default nextConfig;