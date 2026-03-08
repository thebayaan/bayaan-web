import { MetadataRoute } from 'next';
import surahData from '@/data/surahData.json';
import recitersData from '@/data/reciters.json';
import adhkarData from '@/data/adhkar.json';
import type { Surah } from '@/types/quran';
import type { Reciter } from '@/types/reciter';
import type { AdhkarSeedData } from '@/types/adhkar';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bayaan.app';
  const currentDate = new Date();
  const lastModified = currentDate.toISOString();

  const routes: MetadataRoute.Sitemap = [
    // Main pages
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mushaf`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reciters`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/adhkar`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/settings/translations`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Add all Surah pages
  const surahs = surahData as Surah[];
  const surahRoutes: MetadataRoute.Sitemap = surahs.map((surah) => ({
    url: `${baseUrl}/mushaf/${surah.id}`,
    lastModified,
    changeFrequency: 'yearly',
    priority: 0.8,
  }));

  // Add reciter pages
  const reciters = recitersData as Reciter[];
  const reciterRoutes: MetadataRoute.Sitemap = reciters.map((reciter) => ({
    url: `${baseUrl}/reciter/${reciter.id}`,
    lastModified,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  // Add adhkar category pages
  const adhkarSeedData = adhkarData as AdhkarSeedData;
  const adhkarRoutes: MetadataRoute.Sitemap = adhkarSeedData.categories.map((category) => ({
    url: `${baseUrl}/adhkar/${category.id}`,
    lastModified,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  // Popular Surah pages get higher priority
  const popularSurahs = [1, 2, 18, 36, 55, 67, 112, 113, 114]; // Al-Fatiha, Al-Baqarah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk, Al-Ikhlas, Al-Falaq, An-Nas
  surahRoutes.forEach((route) => {
    const surahNumber = parseInt(route.url.split('/').pop() || '0');
    if (popularSurahs.includes(surahNumber)) {
      route.priority = 0.9;
      route.changeFrequency = 'monthly';
    }
  });

  return [
    ...routes,
    ...surahRoutes,
    ...reciterRoutes,
    ...adhkarRoutes,
  ];
}