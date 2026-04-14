"use client";

import { usePlayerStore } from "@/stores/player-store";
import { PlayIcon } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface QueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueuePanel({
  open,
  onOpenChange,
}: QueuePanelProps): React.ReactElement {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const upcomingTracks = tracks.slice(currentIndex + 1);
  const currentTrack = tracks[currentIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] bg-background border-border p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>Queue</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Now Playing */}
          {currentTrack && (
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Now Playing
              </p>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                <div className="flex items-center justify-center gap-0.5 w-6">
                  {isPlaying ? (
                    <>
                      <span className="w-0.5 h-3 bg-foreground rounded-full animate-pulse" />
                      <span className="w-0.5 h-4 bg-foreground rounded-full animate-pulse" />
                      <span className="w-0.5 h-2 bg-foreground rounded-full animate-pulse" />
                    </>
                  ) : (
                    <PlayIcon size={12} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingTracks.length > 0 && (
            <div className="p-4 pt-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Next Up ({upcomingTracks.length})
              </p>
              <div className="space-y-1">
                {upcomingTracks.map((track, idx) => (
                  <button
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      void updateQueue(tracks, currentIndex + 1 + idx);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg w-full text-left hover:bg-muted transition-colors"
                  >
                    <span className="text-xs text-muted-foreground w-6 text-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tracks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>Queue is empty</p>
              <p className="text-xs mt-1">
                Select a reciter and surah to start listening
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
