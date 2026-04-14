import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thebayaan.com",
        pathname: "/assets/**",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
