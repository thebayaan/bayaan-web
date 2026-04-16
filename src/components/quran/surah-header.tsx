import { surahGlyphMap } from "@/data/surah-glyph-map";

interface SurahHeaderProps {
  surahNumber: number;
  surahName: string;
  showBismillah: boolean;
}

export function SurahHeader({ surahNumber, surahName, showBismillah }: SurahHeaderProps) {
  const glyph = surahGlyphMap[surahNumber];
  return (
    <div className="py-4 text-center">
      <div className="inline-flex items-center justify-center rounded-xl border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] px-8 py-2">
        {glyph ? (
          <span className="font-surah-names text-3xl">{glyph}</span>
        ) : (
          <span className="text-lg font-semibold">{surahName}</span>
        )}
      </div>
      {showBismillah && surahNumber !== 9 && surahNumber !== 1 && (
        <p className="mt-4 font-[UthmanicHafs] text-2xl" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </div>
  );
}
