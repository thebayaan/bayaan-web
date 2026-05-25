import type { QcfWord } from "@/types/quran-api";
import {
  MUSHAF_BISMILLAH,
  BASMALLAH_GLYPH_V1,
  BASMALLAH_GLYPH_V2,
} from "@/components/quran/mushaf-layout";
import { getTajweedV4FontPalette, type TajweedPaletteTheme } from "@/lib/tajweed-v4-palettes";

/** Quran.com-compatible mushaf / script options. */
export type MushafFontId = "qcf_v2" | "qcf_v1" | "qcf_tajweed_v4" | "indopak";

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
  unicodeField?: "text_indopak";
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
  /** CSS justify for mushaf lines (QCF glyph fonts). */
  mushafLineJustify: boolean;
  /** Center each line on the page (IndoPak Nastaleeq). */
  mushafLineCenter: boolean;
  /** Separator between words when joining unicode mushaf lines. */
  mushafWordSeparator: string;
  /** Decorative basmallah ligature from page-1 QCF glyphs. */
  basmallahMode: "glyph" | "unicode";
  totalPages: number;
  /** Scale factor for dynamic page width: maxWidth = scale * fontSize (in rem). */
  mushafPageWidthScale?: number;
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
    mushafLineJustify: true,
    mushafLineCenter: false,
    mushafWordSeparator: "\u200A",
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
    mushafLineJustify: true,
    mushafLineCenter: false,
    mushafWordSeparator: "\u200A",
    basmallahMode: "glyph",
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
    mushafLineJustify: true,
    mushafLineCenter: false,
    mushafWordSeparator: "\u200A",
    basmallahMode: "glyph",
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
    mushafLineJustify: true,
    mushafLineCenter: false,
    mushafWordSeparator: " ",
    basmallahMode: "unicode",
    totalPages: 604,
    mushafPageWidthScale: 20,
  },
];

export const DEFAULT_MUSHAF_FONT_ID: MushafFontId = "qcf_v2";

/** QCF V2 page-1 font used for the decorative basmallah on unicode scripts. */
export const BASMALLAH_GLYPH_FONT_ID: MushafFontId = "qcf_v2";
export const BASMALLAH_GLYPH_PAGE = 1;

const REMOVED_MUSHAF_FONT_IDS = new Set(["uthmani", "qpc_hafs"]);

export function normalizeMushafFontId(id: string): MushafFontId {
  if (REMOVED_MUSHAF_FONT_IDS.has(id)) {
    return DEFAULT_MUSHAF_FONT_ID;
  }
  if (MUSHAF_FONT_OPTIONS.some((option) => option.id === id)) {
    return id as MushafFontId;
  }
  return DEFAULT_MUSHAF_FONT_ID;
}

export function isBuiltinTajweedFont(id: MushafFontId): boolean {
  return id === "qcf_tajweed_v4";
}

export function supportsTajweedColoring(id: MushafFontId): boolean {
  return id !== "qcf_tajweed_v4" && id !== "indopak";
}

export function getBasmallahGlyphText(config: MushafFontConfig): string | null {
  if (config.basmallahMode !== "glyph") return null;
  if (config.glyphField === "code_v1") return BASMALLAH_GLYPH_V1;
  if (config.glyphField === "code_v2") return BASMALLAH_GLYPH_V2;
  return null;
}

export function getBasmallahUnicodeText(): string {
  return MUSHAF_BISMILLAH;
}

export function getBasmallahUnicodeFontFamily(): string {
  return END_MARKER_FONT_FAMILY;
}

export { BASMALLAH_GLYPH_V2 } from "@/components/quran/mushaf-layout";

/** Shared word fields requested for all font modes (superset for cache reuse). */
export const MUSHAF_WORD_FIELDS =
  "verse_key,verse_id,page_number,location,audio_url,text_uthmani,text_imlaei_simple,code_v1,code_v2,text_qpc_hafs,text_indopak,qpc_uthmani_hafs,line_number";

export function getMushafFontConfig(id: MushafFontId): MushafFontConfig {
  const config = MUSHAF_FONT_OPTIONS.find((entry) => entry.id === id);
  if (!config) {
    return getMushafFontConfig(DEFAULT_MUSHAF_FONT_ID);
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

/** Verse-end ayah markers always render in UthmanicHafs (Quran.com guidance). */
export const END_MARKER_FONT_FAMILY = "UthmanicHafs";

export function isVerseEndMarker(word: QcfWord): boolean {
  return word.char_type_name === "end";
}

function getEndMarkerText(word: QcfWord, config?: MushafFontConfig): string {
  if (config?.unicodeField === "text_indopak" && word.text_indopak) {
    return word.text_indopak;
  }
  return word.text_qpc_hafs || word.qpc_uthmani_hafs || word.text_uthmani || "";
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
  return getUnicodeFallback(word);
}

export function getWordDisplayText(
  word: QcfWord,
  config: MushafFontConfig,
  isFontReady: boolean,
): string {
  if (isVerseEndMarker(word)) {
    return getEndMarkerText(word, config);
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
      if (isVerseEndMarker(word)) {
        return (config.glyphField === "code_v1" ? word.code_v1 : word.code_v2) ?? "";
      }
      const glyph = config.glyphField === "code_v1" ? (word.code_v1 ?? "") : (word.code_v2 ?? "");
      return glyph.replace(/ /g, hairSpace);
    })
    .filter(Boolean)
    .join(hairSpace);
}

/** IndoPak unicode lines join on regular spaces so justify can fill the line. */
export function joinMushafUnicodeLine(
  words: QcfWord[],
  getWordText: (word: QcfWord) => string | null,
  separator = " ",
): string {
  return words
    .map((word) => getWordText(word) ?? "")
    .filter(Boolean)
    .join(separator);
}

export function joinMushafLineText(
  words: QcfWord[],
  config: MushafFontConfig,
  getWordText: (word: QcfWord) => string | null,
): string {
  if (config.useGlyphLineJoin) {
    return joinMushafGlyphLine(words, config);
  }
  return joinMushafUnicodeLine(words, getWordText, config.mushafWordSeparator);
}

export function getWordFontFamily(
  word: QcfWord,
  config: MushafFontConfig,
  loader: MushafFontLoader,
): string {
  if (isVerseEndMarker(word)) {
    if (config.unicodeField === "text_indopak") {
      return config.staticFontFamily ?? END_MARKER_FONT_FAMILY;
    }
    return END_MARKER_FONT_FAMILY;
  }
  if (config.rendering === "unicode") {
    return config.staticFontFamily ?? END_MARKER_FONT_FAMILY;
  }
  return loader.isPageFontLoaded(word.page_number)
    ? getPageFontName(config, word.page_number)
    : END_MARKER_FONT_FAMILY;
}

export interface MushafFontLoader {
  isPageFontLoaded: (pageNum: number) => boolean;
  getFontFamily: (pageNum: number) => string;
  isStaticFontLoaded: boolean;
}

export interface MushafFontResolver extends MushafFontLoader {
  config: MushafFontConfig;
  getWordText: (word: QcfWord) => string | null;
  getWordFontFamily: (word: QcfWord) => string;
  getPageFontPalette?: (pageNum: number) => string | undefined;
  isBasmallahGlyphLoaded: () => boolean;
  getBasmallahFontFamily: () => string;
  useGlyphLineJoin: boolean;
  mushafLineJustify: boolean;
  mushafLineCenter: boolean;
}

/** @deprecated Use MushafFontResolver */
export type QcfFontResolver = Pick<MushafFontResolver, "isPageFontLoaded" | "getFontFamily">;

export function createMushafFontResolver(
  config: MushafFontConfig,
  loader: MushafFontLoader,
  options?: { tajweedTheme?: TajweedPaletteTheme; basmallahLoader?: MushafFontLoader },
): MushafFontResolver {
  const isReady = (pageNum: number) =>
    config.rendering === "unicode" ? loader.isStaticFontLoaded : loader.isPageFontLoaded(pageNum);

  const basmallahConfig = getMushafFontConfig(BASMALLAH_GLYPH_FONT_ID);
  const nativeBasmallahGlyphLoaded =
    config.basmallahMode === "glyph" && loader.isPageFontLoaded(BASMALLAH_GLYPH_PAGE);
  const fallbackBasmallahGlyphLoaded =
    options?.basmallahLoader?.isPageFontLoaded(BASMALLAH_GLYPH_PAGE) ?? false;

  return {
    config,
    isPageFontLoaded: loader.isPageFontLoaded,
    getFontFamily: (pageNum) =>
      config.rendering === "unicode"
        ? (config.staticFontFamily ?? END_MARKER_FONT_FAMILY)
        : loader.getFontFamily(pageNum),
    isStaticFontLoaded: loader.isStaticFontLoaded,
    useGlyphLineJoin: config.useGlyphLineJoin,
    mushafLineJustify: config.mushafLineJustify,
    mushafLineCenter: config.mushafLineCenter,
    getWordText: (word) => getWordDisplayText(word, config, isReady(word.page_number)),
    getWordFontFamily: (word) => getWordFontFamily(word, config, loader),
    isBasmallahGlyphLoaded: () => nativeBasmallahGlyphLoaded || fallbackBasmallahGlyphLoaded,
    getBasmallahFontFamily: () => {
      if (nativeBasmallahGlyphLoaded) {
        return loader.getFontFamily(BASMALLAH_GLYPH_PAGE);
      }
      if (fallbackBasmallahGlyphLoaded && options?.basmallahLoader) {
        return options.basmallahLoader.getFontFamily(BASMALLAH_GLYPH_PAGE);
      }
      return getPageFontName(basmallahConfig, BASMALLAH_GLYPH_PAGE);
    },
    getPageFontPalette:
      config.id === "qcf_tajweed_v4" && options?.tajweedTheme
        ? (pageNum) => {
            const fontFamily = getPageFontName(config, pageNum);
            return getTajweedV4FontPalette(fontFamily, options.tajweedTheme!);
          }
        : undefined,
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
