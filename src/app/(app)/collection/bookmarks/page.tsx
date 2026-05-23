"use client";

import Link from "next/link";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { QuranIcon } from "@/components/icons";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahById = new Map<number, Surah>(surahs.map((s) => [s.id, s]));

export default function BookmarksPage() {
  const { bookmarks, isLoading, removeBookmark } = useBookmarks();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Bookmarks</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-sunken h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-12 text-center">
          <QuranIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookmarks yet</p>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Tap the bookmark icon next to any verse while reading.
          </p>
          <Link
            href="/quran"
            className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Open the Quran
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {bookmarks.map((bm) => {
            const surah = surahById.get(bm.surah_number);
            return (
              <li
                key={bm.id}
                className="group bg-surface-raised hover:bg-accent relative flex items-center justify-between rounded-lg pr-2 transition-colors"
              >
                <Link
                  href={`/quran/${bm.surah_number}/${bm.ayah_number}`}
                  className="block flex-1 p-3"
                >
                  <p className="text-sm font-medium">
                    {surah ? `Surah ${surah.name}` : `Surah ${bm.surah_number}`}{" "}
                    <span className="text-muted-foreground">· {bm.verse_key}</span>
                  </p>
                  {surah ? (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {surah.translated_name_english}
                    </p>
                  ) : null}
                  {bm.note ? (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{bm.note}</p>
                  ) : null}
                </Link>
                <button
                  onClick={() => void removeBookmark(bm.verse_key)}
                  aria-label={`Remove bookmark from ${bm.verse_key}`}
                  className="text-muted-foreground hover:text-destructive shrink-0 rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100 focus:opacity-100"
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
