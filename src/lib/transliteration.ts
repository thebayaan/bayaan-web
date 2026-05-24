type TransliterationEntry = { t: string };
type TransliterationData = Record<string, TransliterationEntry>;

let cache: TransliterationData | null = null;
let loadPromise: Promise<TransliterationData> | null = null;

export async function loadTransliterationData(): Promise<TransliterationData> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch("/data/transliteration.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Transliteration load failed (${response.status})`);
      return response.json() as Promise<TransliterationData>;
    })
    .then((data) => {
      cache = data;
      return data;
    });

  return loadPromise;
}

export async function getVerseTransliteration(verseKey: string): Promise<string | null> {
  const data = await loadTransliterationData();
  return data[verseKey]?.t ?? null;
}
