import Image from "next/image";
import type { Reciter } from "@/types/reciter";

interface ReciterHeaderProps {
  reciter: Reciter;
}

export function ReciterHeader({ reciter }: ReciterHeaderProps) {
  return (
    <div className="flex items-end gap-6 p-6 pb-4">
      <div className="w-48 h-48 rounded-xl overflow-hidden bg-[var(--text-alpha-06)] shrink-0 shadow-lg">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            width={192}
            height={192}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Reciter
        </p>
        <h1 className="text-4xl font-bold mb-2">{reciter.name}</h1>
        {reciter.bio && (
          <p className="text-sm text-muted-foreground max-w-lg line-clamp-2">
            {reciter.bio}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {reciter.rewayat.length} rewayat &middot;{" "}
          {reciter.rewayat[0]?.surah_total ?? 0} surahs
        </p>
      </div>
    </div>
  );
}
