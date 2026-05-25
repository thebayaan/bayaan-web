import useSWR from "swr";

export interface TranslationResource {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
}

interface TranslationsResponse {
  translations: TranslationResource[];
}

const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function fetchTranslations(): Promise<TranslationResource[]> {
  const response = await fetch(`${BASE_URL}/api/quran/resources/translations?language=en`);
  if (!response.ok) {
    throw new Error(`Translations API error: ${response.status}`);
  }
  const body = (await response.json()) as TranslationsResponse;
  return body.translations ?? [];
}

/** Popular English translations used as fallback when the API is unavailable. */
export const FALLBACK_TRANSLATIONS: TranslationResource[] = [
  {
    id: 131,
    name: "Clear Quran",
    author_name: "Dr. Mustafa Khattab",
    slug: "en-clear-quran",
    language_name: "english",
  },
  {
    id: 20,
    name: "Saheeh International",
    author_name: "Saheeh International",
    slug: "en-sahih-international",
    language_name: "english",
  },
  {
    id: 85,
    name: "English Translation (Yusuf Ali)",
    author_name: "Abdullah Yusuf Ali",
    slug: "en-yusuf-ali",
    language_name: "english",
  },
  {
    id: 19,
    name: "Pickthall",
    author_name: "Mohammed Marmaduke Pickthall",
    slug: "en-pickthall",
    language_name: "english",
  },
  {
    id: 22,
    name: "Muhsin Khan",
    author_name: "Dr. Muhsin Khan",
    slug: "en-muhsin-khan",
    language_name: "english",
  },
];

export function useTranslationResources(): {
  translations: TranslationResource[];
  isLoading: boolean;
} {
  const { data, error, isLoading } = useSWR("quran-translation-resources", fetchTranslations, {
    revalidateOnFocus: false,
    dedupingInterval: 86400000,
  });

  return {
    translations: data ?? (error ? FALLBACK_TRANSLATIONS : FALLBACK_TRANSLATIONS),
    isLoading,
  };
}
