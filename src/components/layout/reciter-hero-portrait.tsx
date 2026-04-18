"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  name: string;
  imageUrl?: string;
}

export function ReciterHeroPortrait({ name, imageUrl }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const monogram = (name.trim().charAt(0) || "?").toUpperCase();

  if (imageUrl) {
    return (
      <div
        className="ease-standard relative h-[140px] w-[140px] shrink-0 overflow-hidden rounded-full shadow-[var(--elevation-m)] transition-opacity duration-[350ms] sm:h-[180px] sm:w-[180px] lg:h-[220px] lg:w-[220px]"
        style={{ opacity: imgLoaded ? 1 : 0 }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 180px, 140px"
          className="object-cover"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-full shadow-[var(--elevation-m)] sm:h-[180px] sm:w-[180px] lg:h-[220px] lg:w-[220px]"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--brand-light), var(--brand-main) 45%, color-mix(in oklch, var(--brand-main), black 40%) 100%)",
      }}
    >
      <span className="text-[48px] leading-none font-bold tracking-tight text-[var(--brand-main-foreground)] sm:text-[60px] lg:text-[72px]">
        {monogram}
      </span>
    </div>
  );
}
