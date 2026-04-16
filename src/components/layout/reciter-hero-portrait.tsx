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
        className="ease-standard relative h-[220px] w-[220px] shrink-0 overflow-hidden rounded-full shadow-[var(--elevation-m)] transition-opacity duration-[350ms]"
        style={{ opacity: imgLoaded ? 1 : 0 }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="220px"
          className="object-cover"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-[220px] w-[220px] shrink-0 items-center justify-center rounded-full shadow-[var(--elevation-m)]"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--brand-light), var(--brand-main) 45%, color-mix(in oklch, var(--brand-main), black 40%) 100%)",
      }}
    >
      <span className="text-[72px] leading-none font-bold tracking-tight text-[var(--brand-main-foreground)]">
        {monogram}
      </span>
    </div>
  );
}
