import { surahGlyphMap } from "@/data/surah-glyph-map";
import {
  BASMALLAH_GLYPH_V2,
  getBasmallahGlyphText,
  getBasmallahUnicodeFontFamily,
  getBasmallahUnicodeText,
  type MushafFontResolver,
} from "@/lib/mushaf-fonts";
import { cn } from "@/lib/utils";

export function mushafSurahAnchorId(surahNumber: number): string {
  return `mushaf-surah-${surahNumber}-anchor`;
}

export function MushafSurahHeader({
  surahNumber,
  className,
}: {
  surahNumber: number;
  className?: string;
}) {
  const glyph = surahGlyphMap[surahNumber];
  if (!glyph) return null;
  return (
    <div
      id={mushafSurahAnchorId(surahNumber)}
      className={cn(
        "flex w-full scroll-mt-16 items-center justify-center py-2 select-none",
        className,
      )}
      aria-label={`Surah ${surahNumber}`}
    >
      <span className="font-surah-names text-[2.2rem] leading-none">{glyph}</span>
    </div>
  );
}

function resolveBasmallahRender(fontResolver?: MushafFontResolver): {
  mode: "glyph" | "unicode";
  text: string;
  fontFamily: string;
  fontPalette?: string;
} {
  if (!fontResolver) {
    return {
      mode: "unicode",
      text: getBasmallahUnicodeText(),
      fontFamily: getBasmallahUnicodeFontFamily(),
    };
  }

  const config = fontResolver.config;
  const nativeGlyph = getBasmallahGlyphText(config);
  if (nativeGlyph && config.basmallahMode === "glyph" && fontResolver.isPageFontLoaded(1)) {
    return {
      mode: "glyph",
      text: nativeGlyph,
      fontFamily: fontResolver.getFontFamily(1),
      fontPalette: fontResolver.getPageFontPalette?.(1),
    };
  }

  if (fontResolver.isBasmallahGlyphLoaded()) {
    return {
      mode: "glyph",
      text: BASMALLAH_GLYPH_V2,
      fontFamily: fontResolver.getBasmallahFontFamily(),
    };
  }

  return {
    mode: "unicode",
    text: getBasmallahUnicodeText(),
    fontFamily: getBasmallahUnicodeFontFamily(),
  };
}

export function MushafBasmallah({
  fontSize,
  fontResolver,
  className,
}: {
  fontSize: string;
  fontResolver?: MushafFontResolver;
  className?: string;
}) {
  const ariaLabel = "Bismillah ar-Rahman ar-Raheem";
  const { mode, text, fontFamily, fontPalette } = resolveBasmallahRender(fontResolver);

  if (mode === "glyph") {
    return (
      <div
        dir="rtl"
        lang="ar"
        aria-label={ariaLabel}
        className={cn("w-full py-1 text-center leading-[1.4] select-none", className)}
        style={{
          fontFamily,
          fontSize,
          ...(fontPalette ? { fontPalette } : undefined),
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <p
      dir="rtl"
      lang="ar"
      aria-label={ariaLabel}
      className={cn("w-full text-center leading-[1.9]", className)}
      style={{ fontFamily, fontSize }}
    >
      {text}
    </p>
  );
}
