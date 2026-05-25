import type { MetadataRoute } from "next";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { getCategories } from "@/data/adhkar-data";

const surahs = surahData as unknown as Surah[];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reciters`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/quran`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/adhkar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const surahRoutes: MetadataRoute.Sitemap = surahs.map((s) => ({
    url: `${SITE_URL}/quran/${s.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const adhkarRoutes: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE_URL}/adhkar/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...surahRoutes, ...adhkarRoutes];
}
