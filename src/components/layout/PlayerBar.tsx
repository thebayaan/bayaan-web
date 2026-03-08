import { cn } from "@/lib/cn";
import { Divider } from "@/components/ui/Divider";
import { Play, SkipBack, SkipForward, Volume2 } from "lucide-react";

/**
 * PlayerBar — sticky bottom audio player bar.
 * Server component (no interactivity yet). Will be wired to Zustand player
 * store in Phase 3.
 */
export function PlayerBar() {
  return (
    <footer
      className={cn(
        "flex items-center gap-4 px-5",
        "h-[72px] shrink-0",
        "border-t",
      )}
      style={{ borderColor: "var(--color-divider)" }}
      aria-label="Audio player"
    >
      {/* Track info */}
      <div className="flex items-center gap-3 w-[220px] shrink-0">
        {/* Album art placeholder */}
        <div
          className="h-10 w-10 rounded-lg shrink-0"
          style={{ backgroundColor: "var(--color-secondary-bg)" }}
          aria-hidden="true"
        >
          <div className="h-full w-full rounded-lg flex items-center justify-center">
            <Volume2
              size={14}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span
            className="text-xs font-medium truncate"
            style={{ color: "var(--color-hint)" }}
          >
            No track playing
          </span>
          <span
            className="text-[11px] truncate"
            style={{ color: "var(--color-hint)" }}
          >
            Select a reciter to begin
          </span>
        </div>
      </div>

      <Divider orientation="vertical" className="h-6" />

      {/* Controls — center */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* Transport buttons */}
        <div className="flex items-center gap-3">
          <PlayerControlBtn label="Previous track" disabled>
            <SkipBack size={16} strokeWidth={1.8} />
          </PlayerControlBtn>

          <button
            aria-label="Play"
            disabled
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center",
              "transition-all duration-150",
              "opacity-40 cursor-not-allowed",
            )}
            style={{
              backgroundColor: "var(--color-text)",
              color: "var(--color-background)",
            }}
          >
            <Play size={16} strokeWidth={2} className="translate-x-0.5" />
          </button>

          <PlayerControlBtn label="Next track" disabled>
            <SkipForward size={16} strokeWidth={1.8} />
          </PlayerControlBtn>
        </div>

        {/* Progress bar — placeholder */}
        <div className="w-full max-w-sm flex items-center gap-2">
          <span
            className="text-[10px] tabular-nums w-7 text-right"
            style={{ color: "var(--color-hint)" }}
          >
            0:00
          </span>
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-secondary-bg)" }}
          >
            <div
              className="h-full w-0 rounded-full"
              style={{ backgroundColor: "var(--color-icon)" }}
            />
          </div>
          <span
            className="text-[10px] tabular-nums w-7"
            style={{ color: "var(--color-hint)" }}
          >
            0:00
          </span>
        </div>
      </div>

      <Divider orientation="vertical" className="h-6" />

      {/* Volume — right */}
      <div className="w-[220px] shrink-0 flex items-center justify-end gap-2">
        <Volume2
          size={14}
          strokeWidth={1.5}
          style={{ color: "var(--color-icon)" }}
        />
        <div
          className="w-20 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-secondary-bg)" }}
        >
          <div
            className="h-full w-3/4 rounded-full"
            style={{ backgroundColor: "var(--color-icon)" }}
          />
        </div>
      </div>
    </footer>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function PlayerControlBtn({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center",
        "transition-all duration-150",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-[var(--color-hover)] text-[var(--color-icon)] hover:text-[var(--color-label)]",
      )}
      style={{ color: "var(--color-icon)" }}
    >
      {children}
    </button>
  );
}
