import { surahGlyphMap } from "@/data/surah-glyph-map";

interface SurahHeaderProps {
  surahNumber: number;
  surahName: string;
  showBismillah: boolean;
}

export function SurahHeader({
  surahNumber,
  surahName,
  showBismillah,
}: SurahHeaderProps) {
  const glyph = surahGlyphMap[surahNumber];
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center px-8 py-2 rounded-xl bg-[var(--text-alpha-04)] border border-[var(--text-alpha-06)]">
        {glyph ? (
          <span className="font-surah-names text-3xl">{glyph}</span>
        ) : (
          <span className="text-lg font-semibold">{surahName}</span>
        )}
      </div>
      {showBismillah && surahNumber !== 9 && surahNumber !== 1 && (
        <p className="text-2xl mt-4 font-[UthmanicHafs]" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </div>
  );
}
