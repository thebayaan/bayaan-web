"use client";

import { useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/audio";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface QueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueuePanel({ open, onOpenChange }: QueuePanelProps): React.ReactElement {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const skipToIndex = usePlayerStore((s) => s.skipToIndex);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // currentIndex of -1 means no active track; treat slice bounds safely.
  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;
  const history = currentIndex > 0 ? tracks.slice(0, currentIndex) : [];
  const upcoming = currentIndex < 0 ? [] : tracks.slice(safeCurrentIndex);

  function handleClose(): void {
    onOpenChange(false);
  }

  function handleJump(absoluteIndex: number): void {
    void skipToIndex(absoluteIndex);
  }

  function handleRemove(absoluteIndex: number): void {
    removeFromQueue([absoluteIndex]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-raised border-border-divider w-[380px] border-l p-0">
        <aside className="flex h-full w-full flex-col">
          <header className="border-border-divider flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-foreground text-base font-bold">Up Next</h2>
              <span className="text-muted-foreground text-xs font-medium">
                {upcoming.length} {upcoming.length === 1 ? "track" : "tracks"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearQueue}
                className="text-muted-foreground hover:text-foreground duration-fast ease-standard rounded px-2 py-1 text-xs font-semibold transition-colors"
              >
                Clear queue
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close queue"
                className="text-muted-foreground hover:bg-surface-sunken flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              <div className="border-border-divider border-b">
                <button
                  type="button"
                  onClick={() => setHistoryExpanded((v) => !v)}
                  className="hover:bg-surface-sunken duration-fast ease-standard flex w-full items-center justify-between px-5 py-3 text-left transition-colors"
                >
                  <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
                    History · {history.length}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-muted-foreground duration-fast transition-transform ${
                      historyExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {historyExpanded ? (
                  <ul className="pb-2">
                    {history.map((track, i) => (
                      <QueueRow
                        key={`history-${track.id}-${i}`}
                        track={track}
                        isActive={false}
                        onJump={() => handleJump(i)}
                        onRemove={() => handleRemove(i)}
                      />
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {upcoming.length > 0 ? (
              <ul className="py-2">
                {upcoming.map((track, offset) => {
                  const absoluteIndex = safeCurrentIndex + offset;
                  return (
                    <QueueRow
                      key={`up-${track.id}-${absoluteIndex}`}
                      track={track}
                      isActive={offset === 0 && currentIndex >= 0}
                      onJump={() => handleJump(absoluteIndex)}
                      onRemove={() => handleRemove(absoluteIndex)}
                    />
                  );
                })}
              </ul>
            ) : null}

            {tracks.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <p>Queue is empty</p>
                <p className="mt-1 text-xs">Select a reciter and surah to start listening</p>
              </div>
            ) : null}
          </div>
        </aside>
      </SheetContent>
    </Sheet>
  );
}

interface QueueRowProps {
  track: Track;
  isActive: boolean;
  onJump: () => void;
  onRemove: () => void;
}

function QueueRow({ track, isActive, onJump, onRemove }: QueueRowProps): React.ReactElement {
  return (
    <li className="group/qrow relative">
      <button
        type="button"
        onClick={onJump}
        className={`hover:bg-surface-sunken duration-fast ease-standard flex w-full items-center gap-3 px-5 py-3 pr-12 text-left transition-colors ${
          isActive ? "bg-brand-light" : ""
        }`}
      >
        <div className="bg-surface-sunken h-10 w-10 shrink-0 overflow-hidden rounded-md">
          {track.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.artwork} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              isActive ? "text-brand-main" : "text-foreground"
            }`}
          >
            {track.title}
          </div>
          <div className="text-muted-foreground truncate text-xs">{track.reciterName}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from queue"
        className="text-muted-foreground hover:text-foreground hover:bg-surface-raised absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/qrow:opacity-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </li>
  );
}
