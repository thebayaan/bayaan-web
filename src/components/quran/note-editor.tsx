"use client";

import { useEffect, useRef, useState } from "react";
import { useNotes } from "@/hooks/use-notes";

export function NoteEditorButton({
  verseKey,
  className,
}: {
  verseKey: string;
  className?: string;
}) {
  const { byKey, upsertNote, removeNote } = useNotes();
  const existing = byKey.get(verseKey);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue(existing?.content ?? "");
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, existing]);

  async function handleSave(): Promise<void> {
    const trimmed = value.trim();
    setPending(true);
    try {
      if (trimmed.length === 0 && existing) {
        await removeNote(verseKey);
      } else if (trimmed.length > 0) {
        await upsertNote(verseKey, trimmed);
      }
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={existing ? `Edit note on ${verseKey}` : `Add note to ${verseKey}`}
        aria-expanded={open}
        className={className}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        {existing ? (
          <span
            aria-hidden="true"
            className="bg-foreground absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full"
          />
        ) : null}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label={`Note for ${verseKey}`}
            className="border-border bg-background absolute right-0 z-20 mt-1 w-80 rounded-xl border p-3 shadow-lg"
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Write a note for this verse…"
              rows={4}
              className="w-full resize-none rounded-lg border border-[var(--text-alpha-10)] bg-[var(--text-alpha-04)] p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-alpha-35)]"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1 text-xs transition-colors hover:bg-[var(--text-alpha-10)]"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={pending}
                className="bg-foreground text-background rounded-lg px-3 py-1 text-xs font-medium transition-opacity disabled:opacity-50"
              >
                {pending ? "Saving…" : existing ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
