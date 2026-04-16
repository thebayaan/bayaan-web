"use client";

import { useNotes } from "@/hooks/use-notes";
import Link from "next/link";

export default function NotesPage() {
  const { notes, isLoading } = useNotes();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Notes</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No notes yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add notes to verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/quran/${note.verse_key.split(":")[0]}`}
              className="block rounded-lg bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium">{note.verse_key}</p>
                <span className="text-muted-foreground text-xs">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">{note.content}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
