import Image from "next/image";
import Link from "next/link";
import type { Reciter } from "@/types/reciter";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
  reciter: Reciter;
  className?: string;
  /** Compact (120px) for horizontal-scroll sections (default). Full for grids. */
  variant?: "compact" | "full";
}

export function ReciterCard({ reciter, className, variant = "compact" }: ReciterCardProps) {
  const rewayatCount = reciter.rewayat.length;
  const rewayatLabel =
    rewayatCount === 0
      ? ""
      : rewayatCount === 1
        ? (reciter.rewayat[0]?.name ?? "")
        : `${rewayatCount} rewayat`;

  const isCompact = variant === "compact";

  return (
    <Link
      href={`/reciter/${reciter.slug}`}
      className={cn(
        "group block shrink-0 rounded-lg transition-colors hover:bg-[var(--text-alpha-04)]",
        isCompact ? "w-[120px]" : "w-full",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-[var(--text-alpha-06)]",
          isCompact ? "h-[120px] w-[120px]" : "mb-2 aspect-square",
        )}
      >
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={isCompact ? "120px" : "(max-width: 768px) 33vw, 160px"}
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={isCompact ? 24 : 32}
              height={isCompact ? 24 : 32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
          </div>
        )}
      </div>
      <p className={cn("truncate font-semibold", isCompact ? "mt-1.5 text-[11px]" : "text-[13px]")}>
        {reciter.name}
      </p>
      {rewayatLabel ? (
        <p
          className={cn(
            "text-muted-foreground truncate font-medium",
            isCompact ? "text-[10px]" : "mt-0.5 text-[11px]",
          )}
        >
          {rewayatLabel}
        </p>
      ) : null}
    </Link>
  );
}
