import type { ReactNode } from "react";
import { surahGlyphMap } from "@/data/surah-glyph-map";
import { MUSHAF_BISMILLAH } from "./mushaf-layout";
import { cn } from "@/lib/utils";

interface MushafFramedPageProps {
  pageNumber: number;
  surahNumber: number;
  children: ReactNode;
}

export function MushafFramedPage({ pageNumber, surahNumber, children }: MushafFramedPageProps) {
  const glyph = surahGlyphMap[surahNumber];
  const showBismillah = pageNumber === 2;

  return (
    <div className="mx-auto w-full max-w-[512px]">
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        {glyph ? (
          <div
            className="mb-4 flex w-full items-center justify-center"
            aria-label={`Surah ${surahNumber}`}
          >
            <span className="font-surah-names text-[2.4rem] leading-none sm:text-[2.75rem]">
              {glyph}
            </span>
          </div>
        ) : null}
        {showBismillah ? (
          <p
            className="mb-6 w-full text-center font-[UthmanicHafs] leading-[2.4] text-[color:var(--color-label)]"
            dir="rtl"
            lang="ar"
          >
            {MUSHAF_BISMILLAH}
          </p>
        ) : null}
      </div>
      <div className={cn("flex flex-col gap-0.5 px-5 pb-8", showBismillah ? "" : "pt-2")}>
        {children}
      </div>
    </div>
  );
}
