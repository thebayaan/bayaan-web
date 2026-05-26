import { surahGlyphMap } from "@/data/surah-glyph-map";
import type { MushafFontResolver } from "@/lib/mushaf-fonts";
import { MushafBasmallah } from "./mushaf-surah-header";

interface SurahHeaderProps {
  surahNumber: number;
  surahName: string;
  showBismillah: boolean;
  fontResolver?: MushafFontResolver;
  fontSize?: string;
}

export function SurahHeader({
  surahNumber,
  surahName,
  showBismillah,
  fontResolver,
  fontSize = "1.8rem",
}: SurahHeaderProps) {
  const glyph = surahGlyphMap[surahNumber];
  return (
    <div className="py-4 text-center">
      <div className="inline-flex items-center justify-center px-4">
        {glyph ? (
          <span className="font-surah-names text-4xl leading-none">{glyph}</span>
        ) : (
          <span className="text-lg font-semibold">{surahName}</span>
        )}
      </div>
      {showBismillah && surahNumber !== 9 && surahNumber !== 1 ? (
        <MushafBasmallah fontSize={fontSize} fontResolver={fontResolver} className="mt-3" />
      ) : null}
    </div>
  );
}
