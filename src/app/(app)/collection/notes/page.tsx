"use client";

import { useNotes } from "@/hooks/use-notes";
import Link from "next/link";

export default function NotesPage() {
  const { notes, isLoading } = useNotes();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notes</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[var(--text-alpha-06)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add notes to verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/quran/${note.verse_key.split(":")[0]}`}
              className="block p-4 rounded-lg bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{note.verse_key}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
