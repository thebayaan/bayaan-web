'use client';

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { BookOpen, Play, Pause, Loader2 } from "lucide-react";
import type { Reciter, Rewayat } from "@/types/reciter";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ensureTrackFields } from "@/types/audio";

interface RewayatCardProps {
  rewayat: Rewayat;
  reciter: Reciter;
}

export function RewayatCard({ rewayat, reciter }: RewayatCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loadQueue, play, pause, playback, getCurrentTrack } = usePlayerStore();

  const currentTrack = getCurrentTrack();
  const isPlayingRewayat = currentTrack?.rewayatId === rewayat.id;
  const isPlaying = playback.state === "playing" && isPlayingRewayat;

  const handlePlay = async () => {
    if (rewayat.surah_total === 0) return;

    try {
      setIsLoading(true);

      if (isPlayingRewayat) {
        if (isPlaying) {
          pause();
        } else {
          await play();
        }
        return;
      }

      // Create tracks for all available surahs in this rewayat
      const tracks = rewayat.surah_list
        .filter((surahNum): surahNum is number => surahNum !== null)
        .map((surahNum) => {
          const paddedNum = surahNum.toString().padStart(3, "0");
          return ensureTrackFields({
            id: `${reciter.id}-${rewayat.id}-${surahNum}`,
            url: `${rewayat.server}${paddedNum}.mp3`,
            title: `Surah ${surahNum}`, // You could map this to actual surah names
            artist: reciter.name,
            reciterId: reciter.id,
            reciterName: reciter.name,
            surahId: surahNum.toString(),
            rewayatId: rewayat.id,
          });
        });

      await loadQueue(tracks, 0);
      await play();
    } catch (error) {
      console.error("Failed to play rewayat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatStyle = (style: string): string => {
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <BookOpen
            size={18}
            style={{ color: "var(--color-icon)" }}
            strokeWidth={1.5}
          />
        </div>

        {rewayat.surah_total > 0 && (
          <Button
            onClick={handlePlay}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-full p-0",
              "transition-all duration-200",
              isPlayingRewayat && "bg-[var(--color-text)] text-[var(--color-background)]"
            )}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={14} strokeWidth={2} />
            ) : (
              <Play
                size={14}
                strokeWidth={2}
                className="translate-x-0.5"
              />
            )}
          </Button>
        )}
      </div>

      <div>
        <h3
          className="font-semibold text-sm mb-2 leading-relaxed"
          style={{ color: "var(--color-label)" }}
        >
          {rewayat.name}
        </h3>

        <div className="space-y-1">
          <div
            className="text-xs"
            style={{ color: "var(--color-hint)" }}
          >
            {formatStyle(rewayat.style)}
          </div>

          <div
            className="text-xs"
            style={{ color: "var(--color-hint)" }}
          >
            {rewayat.surah_total} surahs available
          </div>

          {rewayat.source_type && (
            <div
              className="text-xs capitalize"
              style={{ color: "var(--color-hint)" }}
            >
              Source: {rewayat.source_type.replace('_', ' ')}
            </div>
          )}
        </div>

        {isPlayingRewayat && (
          <div
            className="mt-3 text-xs px-2 py-1 rounded-md text-center"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-label)",
            }}
          >
            Now Playing
          </div>
        )}

        {rewayat.surah_total === 0 && (
          <div
            className="mt-3 text-xs text-center opacity-60"
            style={{ color: "var(--color-hint)" }}
          >
            No audio available
          </div>
        )}
      </div>
    </Card>
  );
}