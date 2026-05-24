export interface TajweedWord {
  word_index: number;
  location: string;
  text: string;
}

export type TajweedData = Record<string, TajweedWord>;

export interface TajweedSegment {
  text: string;
  rule: string | null;
}

export interface ProcessedTajweedWord {
  word_index: number;
  location: string;
  segments: TajweedSegment[];
}

export type ProcessedTajweedData = Record<string, ProcessedTajweedWord>;

/** Verse key (e.g. "1:1") → ordered words with parsed segments. */
export type IndexedTajweedData = Record<string, ProcessedTajweedWord[]>;

function processTajweedWord(wordText: string): TajweedSegment[] {
  const segments: TajweedSegment[] = [];
  const ruleStack: string[] = [];
  let currentIndex = 0;

  const tagRegex = /<rule class="?([a-z_-]+)"?[^>]*>|<\/rule>/g;
  let match: RegExpExecArray | null;

  while (currentIndex < wordText.length) {
    tagRegex.lastIndex = currentIndex;
    match = tagRegex.exec(wordText);

    const nextTagIndex = match ? match.index : wordText.length;

    if (nextTagIndex > currentIndex) {
      const textSegment = wordText.substring(currentIndex, nextTagIndex);
      const currentRule = ruleStack.length > 0 ? ruleStack[ruleStack.length - 1]! : null;
      segments.push({ text: textSegment, rule: currentRule });
    }

    if (!match) break;

    if (match[1]) {
      ruleStack.push(match[1]);
      currentIndex = tagRegex.lastIndex;
    } else {
      ruleStack.pop();
      currentIndex = tagRegex.lastIndex;
    }
  }

  return segments;
}

function createIndexedTajweedData(processedData: ProcessedTajweedData): IndexedTajweedData {
  const indexedData: IndexedTajweedData = {};

  for (const word of Object.values(processedData)) {
    const verseKey = word.location.split(":").slice(0, 2).join(":");
    if (!indexedData[verseKey]) indexedData[verseKey] = [];
    indexedData[verseKey].push(word);
  }

  for (const verseKey of Object.keys(indexedData)) {
    indexedData[verseKey]!.sort((a, b) => a.word_index - b.word_index);
  }

  return indexedData;
}

export function processTajweedData(raw: TajweedData): {
  processed: ProcessedTajweedData;
  indexed: IndexedTajweedData;
  byLocation: Record<string, ProcessedTajweedWord>;
} {
  const processed: ProcessedTajweedData = {};
  const byLocation: Record<string, ProcessedTajweedWord> = {};

  for (const [key, word] of Object.entries(raw)) {
    const entry: ProcessedTajweedWord = {
      word_index: word.word_index,
      location: word.location,
      segments: processTajweedWord(word.text),
    };
    processed[key] = entry;
    byLocation[word.location] = entry;
  }

  return { processed, indexed: createIndexedTajweedData(processed), byLocation };
}

const TAJWEED_JSON_URL = "/data/qpc-hafs-tajweed.json";

let loadPromise: Promise<{
  processed: ProcessedTajweedData;
  indexed: IndexedTajweedData;
  byLocation: Record<string, ProcessedTajweedWord>;
}> | null = null;

export function loadTajweedData(): Promise<{
  processed: ProcessedTajweedData;
  indexed: IndexedTajweedData;
  byLocation: Record<string, ProcessedTajweedWord>;
}> {
  if (!loadPromise) {
    loadPromise = fetch(TAJWEED_JSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load tajweed data (${res.status})`);
        return res.json() as Promise<TajweedData>;
      })
      .then(processTajweedData);
  }
  return loadPromise;
}
