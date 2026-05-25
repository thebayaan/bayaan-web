import type { QcfWord } from "@/types/quran-api";

/** Quran.com-compatible mushaf / script options. */
export type MushafFontId =
  | "qcf_v2"
  | "qcf_v1"
  | "qcf_tajweed_v4"
  | "uthmani"
  | "qpc_hafs"
  | "indopak";

export type MushafFontRendering = "glyph-per-page" | "unicode";

export interface MushafFontConfig {
  id: MushafFontId;
  label: string;
  description: string;
  mushafId: number;
  rendering: MushafFontRendering;
  /** QCF glyph field when rendering is glyph-per-page. */
  glyphField?: "code_v1" | "code_v2";
  /** Primary Unicode field for unicode fonts. */
  unicodeField?: "text_uthmani" | "text_qpc_hafs" | "text_indopak";
  /** CDN version segment for per-page QCF fonts (v1, v2, v4). */
  cdnVersion?: "v1" | "v2" | "v4";
  /** Suffix used in FontFace family names, e.g. p1-v2. */
  fontNameSuffix?: string;
  /** Static font family for unicode rendering. */
  staticFontFamily?: string;
  /** Static font CDN URL (woff2). */
  staticFontUrl?: string;
  /** Whether mushaf lines join glyph codes edge-to-edge. */
  useGlyphLineJoin: boolean;
  /** Decorative basmallah ligature from page-1 QCF glyphs. */
  basmallahMode: "glyph" | "unicode";
  totalPages: number;
}

const QURAN_FONT_CDN = "https://verses.quran.foundation/fonts/quran/hafs";

export const MUSHAF_FONT_OPTIONS: MushafFontConfig[] = [
  {
    id: "qcf_v2",
    label: "King Fahd Complex V2",
    description: "Modern Madani mushaf",
    mushafId: 1,
    rendering: "glyph-per-page",
    glyphField: "code_v2",
    cdnVersion: "v2",
    fontNameSuffix: "v2",
    useGlyphLineJoin: true,
    basmallahMode: "glyph",
    totalPages: 604,
  },
  {
    id: "qcf_v1",
    label: "King Fahd Complex V1",
    description: "Traditional Madani mushaf (1405H print)",
    mushafId: 2,
    rendering: "glyph-per-page",
    glyphField: "code_v1",
    cdnVersion: "v1",
    fontNameSuffix: "v1",
    useGlyphLineJoin: true,
    basmallahMode: "unicode",
    totalPages: 604,
  },
  {
    id: "qcf_tajweed_v4",
    label: "Tajweed Mushaf",
    description: "Color-coded tajweed rules in the font glyphs",
    mushafId: 19,
    rendering: "glyph-per-page",
    glyphField: "code_v2",
    cdnVersion: "v4",
    fontNameSuffix: "v4",
    useGlyphLineJoin: true,
    basmallahMode: "glyph",
    totalPages: 604,
  },
  {
    id: "uthmani",
    label: "Uthmani",
    description: "Standard Uthmani Unicode script (default)",
    mushafId: 4,
    rendering: "unicode",
    unicodeField: "text_uthmani",
    staticFontFamily: "UthmanicHafs",
    staticFontUrl: `${QURAN_FONT_CDN}/uthmanic_hafs/UthmanicHafs1Ver18.woff2`,
    useGlyphLineJoin: false,
    basmallahMode: "unicode",
    totalPages: 604,
  },
  {
    id: "qpc_hafs",
    label: "QPC Hafs",
    description: "King Fahd Complex Unicode script",
    mushafId: 5,
    rendering: "unicode",
    unicodeField: "text_qpc_hafs",
    staticFontFamily: "UthmanicHafs",
    staticFontUrl: `${QURAN_FONT_CDN}/uthmanic_hafs/UthmanicHafs1Ver18.woff2`,
    useGlyphLineJoin: false,
    basmallahMode: "unicode",
    totalPages: 604,
  },
  {
    id: "indopak",
    label: "IndoPak",
    description: "South Asian Nastaleeq script",
    mushafId: 3,
    rendering: "unicode",
    unicodeField: "text_indopak",
    staticFontFamily: "IndoPak",
    staticFontUrl: `${QURAN_FONT_CDN}/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2`,
    useGlyphLineJoin: false,
    basmallahMode: "unicode",
    totalPages: 604,
  },
];

export const DEFAULT_MUSHAF_FONT_ID: MushafFontId = "uthmani";

/** Shared word fields requested for all font modes (superset for cache reuse). */
export const MUSHAF_WORD_FIELDS =
  "verse_key,verse_id,page_number,location,audio_url,text_uthmani,text_imlaei_simple,code_v1,code_v2,text_qpc_hafs,text_indopak,qpc_uthmani_hafs,line_number";

export function getMushafFontConfig(id: MushafFontId): MushafFontConfig {
  const config = MUSHAF_FONT_OPTIONS.find((entry) => entry.id === id);
  if (!config) {
    return MUSHAF_FONT_OPTIONS[0]!;
  }
  return config;
}

export function getPageFontCdnUrl(
  config: MushafFontConfig,
  pageNum: number,
  theme: "light" | "dark" | "sepia" = "light",
): string {
  if (config.rendering !== "glyph-per-page" || !config.cdnVersion) {
    return "";
  }

  if (config.cdnVersion === "v4") {
    const isFirefox = typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);
    if (isFirefox) {
      return `${QURAN_FONT_CDN}/v4/ot-svg/${theme}/woff2/p${pageNum}.woff2`;
    }
    return `${QURAN_FONT_CDN}/v4/colrv1/woff2/p${pageNum}.woff2`;
  }

  return `${QURAN_FONT_CDN}/${config.cdnVersion}/woff2/p${pageNum}.woff2`;
}

export function getPageFontName(config: MushafFontConfig, pageNum: number): string {
  return `p${pageNum}-${config.fontNameSuffix ?? "v2"}`;
}

function getUnicodeFallback(word: QcfWord): string {
  return (
    word.qpc_uthmani_hafs || word.text_qpc_hafs || word.text_uthmani || word.text_indopak || ""
  );
}

function getUnicodePrimary(word: QcfWord, field: MushafFontConfig["unicodeField"]): string {
  if (field === "text_indopak") {
    return word.text_indopak || getUnicodeFallback(word);
  }
  if (field === "text_qpc_hafs") {
    return word.text_qpc_hafs || word.qpc_uthmani_hafs || word.text_uthmani || "";
  }
  return word.text_uthmani || getUnicodeFallback(word);
}

export function getWordDisplayText(
  word: QcfWord,
  config: MushafFontConfig,
  isFontReady: boolean,
): string {
  if (word.char_type_name === "end") {
    return getUnicodeFallback(word);
  }

  if (config.rendering === "unicode") {
    return getUnicodePrimary(word, config.unicodeField);
  }

  if (!isFontReady || !config.glyphField) {
    return getUnicodeFallback(word);
  }

  const glyph = config.glyphField === "code_v1" ? word.code_v1 : word.code_v2;
  return glyph || getUnicodeFallback(word);
}

export function joinMushafGlyphLine(words: QcfWord[], config: MushafFontConfig): string {
  const hairSpace = "\u200A";
  return words
    .map((word) => {
      const glyph = config.glyphField === "code_v1" ? (word.code_v1 ?? "") : (word.code_v2 ?? "");
      return glyph.replace(/ /g, hairSpace);
    })
    .join(hairSpace);
}

export interface MushafFontLoader {
  isPageFontLoaded: (pageNum: number) => boolean;
  getFontFamily: (pageNum: number) => string;
  isStaticFontLoaded: boolean;
}

export interface MushafFontResolver extends MushafFontLoader {
  config: MushafFontConfig;
  getWordText: (word: QcfWord) => string | null;
  useGlyphLineJoin: boolean;
  fontPalette?: string;
}

/** @deprecated Use MushafFontResolver */
export type QcfFontResolver = Pick<MushafFontResolver, "isPageFontLoaded" | "getFontFamily">;

export function createMushafFontResolver(
  config: MushafFontConfig,
  loader: MushafFontLoader,
  options?: { fontPalette?: string },
): MushafFontResolver {
  const isReady = (pageNum: number) =>
    config.rendering === "unicode" ? loader.isStaticFontLoaded : loader.isPageFontLoaded(pageNum);

  return {
    config,
    isPageFontLoaded: loader.isPageFontLoaded,
    getFontFamily: (pageNum) =>
      config.rendering === "unicode"
        ? (config.staticFontFamily ?? "UthmanicHafs")
        : loader.getFontFamily(pageNum),
    isStaticFontLoaded: loader.isStaticFontLoaded,
    useGlyphLineJoin: config.useGlyphLineJoin,
    fontPalette: options?.fontPalette,
    getWordText: (word) => getWordDisplayText(word, config, isReady(word.page_number)),
  };
}

export function resolveTajweedTheme(
  colorMode: "light" | "dark",
  lightThemeId: string,
  resolvedTheme?: "light" | "dark" | "sepia",
): "light" | "dark" | "sepia" {
  if (resolvedTheme === "sepia") return "sepia";
  if (colorMode === "dark") return "dark";
  if (lightThemeId === "parchment") return "sepia";
  return "light";
}
