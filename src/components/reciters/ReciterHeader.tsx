'use client';

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { User, Mic, Calendar, Play, Pause, Loader2 } from "lucide-react";
import type { Reciter } from "@/types/reciter";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ensureTrackFields } from "@/types/audio";

interface ReciterHeaderProps {
  reciter: Reciter;
}

export function ReciterHeader({ reciter }: ReciterHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loadQueue, play, pause, playback, getCurrentTrack } = usePlayerStore();

  const currentTrack = getCurrentTrack();
  const isPlayingReciter = currentTrack?.reciterId === reciter.id;
  const isPlaying = playback.state === "playing" && isPlayingReciter;

  // Get the best rewayat (most complete one)
  const bestRewayat = reciter.rewayat.reduce((best, current) => {
    return current.surah_total > best.surah_total ? current : best;
  }, reciter.rewayat[0]);

  const totalSurahs = reciter.rewayat.reduce((total, r) => total + r.surah_total, 0);

  const handlePlayAll = async () => {
    if (!bestRewayat) return;

    try {
      setIsLoading(true);

      if (isPlayingReciter) {
        if (isPlaying) {
          pause();
        } else {
          await play();
        }
        return;
      }

      // Create tracks for all available surahs in the best rewayat
      const tracks = bestRewayat.surah_list
        .filter((surahNum): surahNum is number => surahNum !== null)
        .map((surahNum) => {
          const paddedNum = surahNum.toString().padStart(3, "0");
          return ensureTrackFields({
            id: `${reciter.id}-${bestRewayat.id}-${surahNum}`,
            url: `${bestRewayat.server}${paddedNum}.mp3`,
            title: `Surah ${surahNum}`, // You could map this to actual surah names
            artist: reciter.name,
            reciterId: reciter.id,
            reciterName: reciter.name,
            surahId: surahNum.toString(),
            rewayatId: bestRewayat.id,
          });
        });

      await loadQueue(tracks, 0);
      await play();
    } catch (error) {
      console.error("Failed to play reciter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="flex items-start gap-6">
      {/* Avatar */}
      <div
        className="h-24 w-24 rounded-2xl shrink-0 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <User
          size={32}
          style={{ color: "var(--color-icon)" }}
          strokeWidth={1.5}
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--color-label)" }}
        >
          {reciter.name}
        </h1>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Mic
              size={14}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1.5}
            />
            <span style={{ color: "var(--color-hint)" }}>
              {reciter.rewayat.length} rewayat
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: "var(--color-icon)" }}
            />
            <span style={{ color: "var(--color-hint)" }}>
              {totalSurahs} surahs total
            </span>
          </div>

          {reciter.date && (
            <>
              <div className="flex items-center gap-1.5">
                <Calendar
                  size={14}
                  style={{ color: "var(--color-icon)" }}
                  strokeWidth={1.5}
                />
                <span style={{ color: "var(--color-hint)" }}>
                  {formatDate(reciter.date)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Primary rewayat info */}
        {bestRewayat && (
          <div className="mb-4">
            <h3
              className="font-medium text-sm mb-1"
              style={{ color: "var(--color-label)" }}
            >
              Primary Rewayat: {bestRewayat.name}
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--color-hint)" }}
            >
              {bestRewayat.style} • {bestRewayat.surah_total} surahs available
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePlayAll}
            disabled={isLoading || !bestRewayat}
            className={cn(
              "px-6 py-2 rounded-full font-medium text-sm",
              "transition-all duration-150 active:scale-95",
              "flex items-center gap-2",
            )}
            style={{
              backgroundColor: "var(--color-text)",
              color: "var(--color-background)",
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} strokeWidth={2} />
            ) : (
              <Play size={16} strokeWidth={2} className="translate-x-0.5" />
            )}
            {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play All"}
          </Button>

          {isPlayingReciter && (
            <span
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-label)",
              }}
            >
              Now Playing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}