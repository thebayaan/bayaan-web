import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://open.thebayaan.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/quran", "/adhkar", "/"],
        disallow: [
          "/api/",
          "/sign-in",
          "/sign-up",
          "/collection",
          "/settings",
          "/search",
          "/reciter",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
