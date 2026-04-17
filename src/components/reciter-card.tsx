import Image from "next/image";
import Link from "next/link";
import type { Reciter } from "@/types/reciter";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
  reciter: Reciter;
  className?: string;
}

export function ReciterCard({ reciter, className }: ReciterCardProps) {
  const rewayatCount = reciter.rewayat.length;
  const rewayatLabel =
    rewayatCount === 0
      ? ""
      : rewayatCount === 1
        ? (reciter.rewayat[0]?.name ?? "")
        : `${rewayatCount} rewayat`;

  return (
    <Link
      href={`/reciter/${reciter.slug}`}
      className={cn(
        "group block w-full rounded-md p-1.5 transition-colors hover:bg-[var(--text-alpha-04)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--text-alpha-06)]">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 18vw, 14vw"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={28}
              height={28}
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
      <p className="mt-1.5 truncate text-[13px] font-semibold">{reciter.name}</p>
      {rewayatLabel ? (
        <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{rewayatLabel}</p>
      ) : null}
    </Link>
  );
}
