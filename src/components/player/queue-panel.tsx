"use client";

import { usePlayerStore } from "@/stores/player-store";
import { PlayIcon } from "@/components/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface QueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueuePanel({ open, onOpenChange }: QueuePanelProps): React.ReactElement {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const upcomingTracks = tracks.slice(currentIndex + 1);
  const currentTrack = tracks[currentIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background border-border w-[380px] p-0">
        <SheetHeader className="border-border border-b p-4">
          <SheetTitle>Queue</SheetTitle>
        </SheetHeader>

        <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Now Playing */}
          {currentTrack && (
            <div className="p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                Now Playing
              </p>
              <div className="bg-muted flex items-center gap-3 rounded-lg p-2">
                <div className="flex w-6 items-center justify-center gap-0.5">
                  {isPlaying ? (
                    <>
                      <span className="bg-foreground h-3 w-0.5 animate-pulse rounded-full" />
                      <span className="bg-foreground h-4 w-0.5 animate-pulse rounded-full" />
                      <span className="bg-foreground h-2 w-0.5 animate-pulse rounded-full" />
                    </>
                  ) : (
                    <PlayIcon size={12} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{currentTrack.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{currentTrack.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingTracks.length > 0 && (
            <div className="p-4 pt-0">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                Next Up ({upcomingTracks.length})
              </p>
              <div className="space-y-1">
                {upcomingTracks.map((track, idx) => (
                  <button
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      void updateQueue(tracks, currentIndex + 1 + idx);
                    }}
                    className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors"
                  >
                    <span className="text-muted-foreground w-6 text-center text-xs">{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{track.title}</p>
                      <p className="text-muted-foreground truncate text-xs">{track.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tracks.length === 0 && (
            <div className="text-muted-foreground p-8 text-center">
              <p>Queue is empty</p>
              <p className="mt-1 text-xs">Select a reciter and surah to start listening</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
