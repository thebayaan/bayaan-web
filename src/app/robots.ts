import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/quran", "/adhkar", "/"],
        disallow: [
          "/api/",
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
