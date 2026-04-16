"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { QuranIcon } from "@/components/icons";
import Link from "next/link";

export default function BookmarksPage() {
  const { bookmarks, isLoading } = useBookmarks();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Bookmarks</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-12 text-center">
          <QuranIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookmarks yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Bookmark verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bm) => (
            <Link
              key={bm.id}
              href={`/quran/${bm.surah_number}`}
              className="flex items-center justify-between rounded-lg bg-[var(--text-alpha-04)] p-3 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <div>
                <p className="text-sm font-medium">{bm.verse_key}</p>
                {bm.note && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{bm.note}</p>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {new Date(bm.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
