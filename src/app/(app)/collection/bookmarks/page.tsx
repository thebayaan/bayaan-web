"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { QuranIcon } from "@/components/icons";
import Link from "next/link";

export default function BookmarksPage() {
  const { bookmarks, isLoading } = useBookmarks();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <QuranIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Bookmark verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bm) => (
            <Link
              key={bm.id}
              href={`/quran/${bm.surah_number}`}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)] transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{bm.verse_key}</p>
                {bm.note && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {bm.note}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(bm.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
