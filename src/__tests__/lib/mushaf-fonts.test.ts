import { describe, it, expect } from "vitest";
import type { QcfWord } from "@/types/quran-api";
import {
  createMushafFontResolver,
  END_MARKER_FONT_FAMILY,
  getMushafFontConfig,
  getWordDisplayText,
  getWordFontFamily,
  getBasmallahGlyphText,
  getBasmallahUnicodeText,
  joinMushafGlyphLine,
  MUSHAF_FONT_OPTIONS,
  normalizeMushafFontId,
} from "@/lib/mushaf-fonts";
import { MUSHAF_BISMILLAH } from "@/components/quran/mushaf-layout";

const mockWord: QcfWord = {
  id: 1,
  position: 1,
  audio_url: null,
  char_type_name: "word",
  code_v1: "\uf001",
  code_v2: "\ufc41",
  page_number: 1,
  line_number: 1,
  text_uthmani: "بِسْمِ",
  text_imlaei_simple: "bism",
  text_qpc_hafs: "بِسۡمِ",
  text_indopak: "بِسْمِ",
  qpc_uthmani_hafs: "بِسْمِ",
  verse_key: "1:1",
  verse_id: 1,
  location: "1:1:1",
};

describe("mushaf-fonts", () => {
  it("exposes all quran.com font options", () => {
    expect(MUSHAF_FONT_OPTIONS.map((option) => option.id)).toEqual([
      "qcf_v2",
      "qcf_v1",
      "qcf_tajweed_v4",
      "indopak",
    ]);
  });

  it("migrates removed font ids to the default", () => {
    expect(normalizeMushafFontId("uthmani")).toBe("qcf_v2");
    expect(normalizeMushafFontId("qpc_hafs")).toBe("qcf_v2");
  });

  it("uses code_v2 glyphs when QCF V2 font is ready", () => {
    const config = getMushafFontConfig("qcf_v2");
    expect(getWordDisplayText(mockWord, config, true)).toBe("\ufc41");
  });

  it("uses code_v1 glyphs when QCF V1 font is ready", () => {
    const config = getMushafFontConfig("qcf_v1");
    expect(getWordDisplayText(mockWord, config, true)).toBe("\uf001");
    expect(getBasmallahGlyphText(config)).toBe("\uFB51\uFB52\uFB53\uFB54");
  });

  it("uses indopak unicode text when IndoPak font is selected", () => {
    const config = getMushafFontConfig("indopak");
    expect(getWordDisplayText(mockWord, config, true)).toBe("بِسْمِ");
  });

  it("uses Uthmani basmallah text for all unicode fonts", () => {
    expect(getBasmallahUnicodeText(getMushafFontConfig("indopak"))).toBe(MUSHAF_BISMILLAH);
  });

  it("falls back to unicode text while glyph fonts load", () => {
    const config = getMushafFontConfig("qcf_v2");
    expect(getWordDisplayText(mockWord, config, false)).toBe("بِسْمِ");
  });

  it("joins glyph lines with hair spaces", () => {
    const secondWord = { ...mockWord, id: 2, position: 2, code_v2: "\ufc42" };
    const config = getMushafFontConfig("qcf_v2");
    expect(joinMushafGlyphLine([mockWord, secondWord], config)).toBe("\ufc41\u200a\ufc42");
  });

  it("creates a resolver with word text helper", () => {
    const config = getMushafFontConfig("qcf_v2");
    const resolver = createMushafFontResolver(config, {
      isPageFontLoaded: () => true,
      getFontFamily: () => "p1-v2",
      isStaticFontLoaded: true,
    });

    expect(resolver.getWordText(mockWord)).toBe("\ufc41");
    expect(resolver.useGlyphLineJoin).toBe(true);
  });

  it("uses qpc hafs text and UthmanicHafs for verse end markers", () => {
    const endMarker: QcfWord = {
      ...mockWord,
      id: 5,
      position: 5,
      char_type_name: "end",
      code_v2: "\ufc45",
      text_qpc_hafs: "۝١",
      qpc_uthmani_hafs: "۝١",
      text_uthmani: "١",
      text_indopak: "١",
    };
    const config = getMushafFontConfig("indopak");
    const loader = {
      isPageFontLoaded: () => true,
      getFontFamily: () => "IndoPak",
      isStaticFontLoaded: true,
    };

    expect(getWordDisplayText(endMarker, config, true)).toBe("۝١");
    expect(getWordFontFamily(endMarker, config, loader)).toBe(END_MARKER_FONT_FAMILY);
    expect(getWordFontFamily(mockWord, config, loader)).toBe("IndoPak");
  });

  it("keeps end marker glyphs in joined mushaf lines", () => {
    const endMarker: QcfWord = {
      ...mockWord,
      id: 5,
      position: 5,
      char_type_name: "end",
      code_v2: "\ufc45",
      text_qpc_hafs: "۝١",
      qpc_uthmani_hafs: "۝١",
    };
    const config = getMushafFontConfig("qcf_v2");
    expect(joinMushafGlyphLine([mockWord, endMarker], config)).toBe("\ufc41\u200a\ufc45");
  });
});
