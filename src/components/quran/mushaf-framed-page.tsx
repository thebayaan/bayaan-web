import type { ReactNode } from "react";
import { surahGlyphMap } from "@/data/surah-glyph-map";
import { MushafBasmallah } from "./mushaf-surah-header";
import type { QcfFontResolver } from "./quran-word";
import { cn } from "@/lib/utils";

interface MushafFramedPageProps {
  pageNumber: number;
  surahNumber: number;
  children: ReactNode;
  /**
   * Optional — when present, page-2's basmallah renders in the
   * decorative KFGQPC ligature instead of the plain UthmanicHafs
   * fallback. `MushafView` always preloads `p1-v2` so on the framed
   * pages this should always be available; tests omit it intentionally.
   */
  fontResolver?: QcfFontResolver;
  fontSize?: string;
}

export function MushafFramedPage({
  pageNumber,
  surahNumber,
  children,
  fontResolver,
  fontSize = "1.8rem",
}: MushafFramedPageProps) {
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
          <MushafBasmallah fontSize={fontSize} fontResolver={fontResolver} className="mb-6" />
        ) : null}
      </div>
      <div className={cn("flex flex-col gap-0 px-5 pb-8", showBismillah ? "" : "pt-2")}>
        {children}
      </div>
    </div>
  );
}
