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
        "group block rounded-lg transition-colors hover:bg-[var(--text-alpha-04)]",
        className,
      )}
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, 160px"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={32}
              height={32}
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
      <p className="truncate text-[13px] leading-tight font-semibold">{reciter.name}</p>
      {rewayatLabel ? (
        <p className="text-muted-foreground mt-0.5 truncate text-[11px] font-medium">
          {rewayatLabel}
        </p>
      ) : null}
    </Link>
  );
}
