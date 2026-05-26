import type { NextConfig } from "next";

// Baseline security headers applied to every response. Kept deliberately
// permissive (no CSP yet — Next 16's inline-script injection makes a strict
// CSP load-bearing, and that's worth a focused follow-up PR). These four
// are the ones with no behaviour risk and broad coverage.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
