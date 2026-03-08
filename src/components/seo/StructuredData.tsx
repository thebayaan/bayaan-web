import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'webpage' | 'article' | 'mobileapp';
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  surahData?: {
    surahNumber: number;
    surahName: string;
    arabicName: string;
    versesCount: number;
    revelationPlace: string;
  };
  verseData?: {
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation?: string;
  };
}

// Safe JSON serialization for structured data
function safeJsonStringify(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 0);
}

export function StructuredData({
  type = 'website',
  title,
  description,
  url,
  image,
  author,
  publishedTime,
  modifiedTime,
  breadcrumbs,
  surahData,
  verseData,
}: StructuredDataProps) {
  // Only render on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return null;
  }
  const baseUrl = 'https://bayaan.app';
  const defaultImage = `${baseUrl}/og-image.png`;

  // Base organization data
  const organizationData = {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Bayaan',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/icons/icon-512.png`,
    },
    description: 'A premium Quran listening experience',
  };

  // Base website data
  const websiteData = {
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    url: baseUrl,
    name: 'Bayaan - Premium Quran Experience',
    description: 'A premium Quran listening experience with beautiful reciters, translations, and adhkar collection',
    publisher: {
      '@id': `${baseUrl}#organization`,
    },
    inLanguage: 'en',
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  };

  // Mobile application data
  const mobileAppData = {
    '@type': 'MobileApplication',
    '@id': `${baseUrl}#mobileapp`,
    name: 'Bayaan',
    description: 'A premium Quran listening experience with beautiful reciters, translations, and adhkar collection',
    url: baseUrl,
    applicationCategory: ['EducationApplication', 'LifestyleApplication'],
    operatingSystem: ['Android', 'iOS', 'Windows', 'macOS'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: organizationData,
    publisher: organizationData,
    installUrl: baseUrl,
    screenshot: [
      `${baseUrl}/screenshots/desktop-mushaf.png`,
      `${baseUrl}/screenshots/mobile-player.png`,
    ],
    featureList: [
      'Read and listen to the Holy Quran',
      'Multiple reciter options',
      'Translations in various languages',
      'Bookmark verses and create playlists',
      'Daily Adhkar and Islamic remembrances',
      'Offline reading capabilities',
      'Search across Quran, reciters, and adhkar',
    ],
    softwareVersion: '1.0',
  };

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [organizationData, websiteData, mobileAppData],
  };

  // Add page-specific data based on type
  if (type === 'webpage' || type === 'article') {
    const pageData: Record<string, unknown> = {
      '@type': type === 'article' ? 'Article' : 'WebPage',
      '@id': url || baseUrl,
      url: url || baseUrl,
      name: title || 'Bayaan',
      headline: title,
      description: description,
      isPartOf: {
        '@id': `${baseUrl}#website`,
      },
      publisher: {
        '@id': `${baseUrl}#organization`,
      },
      inLanguage: 'en',
      image: {
        '@type': 'ImageObject',
        url: image || defaultImage,
        width: 1200,
        height: 630,
      },
    };

    if (author) {
      pageData.author = {
        '@type': 'Person',
        name: author,
      };
    }

    if (publishedTime) {
      pageData.datePublished = publishedTime;
    }

    if (modifiedTime) {
      pageData.dateModified = modifiedTime;
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      pageData.breadcrumb = {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      };
    }

    (structuredData['@graph'] as unknown[]).push(pageData);
  }

  // Add Surah-specific structured data
  if (surahData) {
    const surahStructuredData = {
      '@type': 'CreativeWork',
      '@id': `${baseUrl}/mushaf/${surahData.surahNumber}#surah`,
      name: surahData.surahName,
      alternateName: surahData.arabicName,
      description: `Surah ${surahData.surahName} - Chapter ${surahData.surahNumber} of the Holy Quran`,
      inLanguage: ['ar', 'en'],
      isPartOf: {
        '@type': 'Book',
        name: 'The Holy Quran',
        inLanguage: 'ar',
        author: 'Allah',
        about: 'Islamic religious text',
      },
      position: surahData.surahNumber,
      numberOfPages: surahData.versesCount,
      locationCreated: {
        '@type': 'Place',
        name: surahData.revelationPlace,
      },
      genre: 'Religious Text',
      accessibilityFeature: ['audioDescription', 'alternativeText'],
      educationalLevel: 'All Levels',
      audience: {
        '@type': 'Audience',
        audienceType: 'Muslims and Islamic Studies Students',
      },
    };

    (structuredData['@graph'] as unknown[]).push(surahStructuredData);
  }

  // Add verse-specific structured data
  if (verseData) {
    const verseStructuredData = {
      '@type': 'Quotation',
      '@id': `${baseUrl}/mushaf/${verseData.surahNumber}#verse-${verseData.ayahNumber}`,
      text: verseData.arabicText,
      inLanguage: 'ar',
      isPartOf: {
        '@id': `${baseUrl}/mushaf/${verseData.surahNumber}#surah`,
      },
      position: verseData.ayahNumber,
      about: 'Verse from the Holy Quran',
      creator: 'Allah',
      ...(verseData.translation && {
        translation: {
          '@type': 'CreativeWork',
          text: verseData.translation,
          inLanguage: 'en',
        }
      }),
    };

    (structuredData['@graph'] as unknown[]).push(verseStructuredData);
  }

  const jsonLd = safeJsonStringify(structuredData);

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}