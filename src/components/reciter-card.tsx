import Image from "next/image";
import Link from "next/link";
import type { Reciter } from "@/types/reciter";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
  reciter: Reciter;
  className?: string;
}

export function ReciterCard({ reciter, className }: ReciterCardProps) {
  const primaryRewayat = reciter.rewayat[0];
  const surahCount = primaryRewayat?.surah_total ?? 0;
  const style = primaryRewayat?.style ?? "murattal";

  return (
    <Link
      href={`/reciter/${reciter.slug}`}
      className={cn(
        "group block rounded-xl bg-[var(--text-alpha-04)] p-3 transition-colors hover:bg-[var(--text-alpha-06)]",
        className,
      )}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={48}
              height={48}
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
      <p className="truncate text-sm font-semibold">{reciter.name}</p>
      <p className="text-muted-foreground mt-0.5 text-xs capitalize">
        {style} &middot; {surahCount} Surahs
      </p>
    </Link>
  );
}
