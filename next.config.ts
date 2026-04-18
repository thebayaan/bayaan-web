import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thebayaan.com",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
