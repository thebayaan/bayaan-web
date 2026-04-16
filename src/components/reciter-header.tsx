import Image from "next/image";
import type { Reciter } from "@/types/reciter";

interface ReciterHeaderProps {
  reciter: Reciter;
}

export function ReciterHeader({ reciter }: ReciterHeaderProps) {
  return (
    <div className="flex items-end gap-6 p-6 pb-4">
      <div className="h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-[var(--text-alpha-06)] shadow-lg">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={64}
              height={64}
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
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Reciter
        </p>
        <h1 className="mb-2 text-4xl font-bold">{reciter.name}</h1>
        {reciter.bio && (
          <p className="text-muted-foreground line-clamp-2 max-w-lg text-sm">{reciter.bio}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {reciter.rewayat.length} rewayat &middot; {reciter.rewayat[0]?.surah_total ?? 0} surahs
        </p>
      </div>
    </div>
  );
}
