"use client";

import Link from "next/link";
import { HeartIcon, QuranIcon, PlayIcon } from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

interface Section {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
}

const SECTIONS: Section[] = [
  {
    href: "/collection/playlists",
    label: "Playlists",
    description: "Your custom playlists",
    icon: PlayIcon,
  },
  {
    href: "/collection/favorites",
    label: "Favorites",
    description: "Favorited tracks",
    icon: HeartIcon,
  },
  {
    href: "/collection/bookmarks",
    label: "Bookmarks",
    description: "Saved verses",
    icon: QuranIcon,
  },
  {
    href: "/collection/notes",
    label: "Notes",
    description: "Verse annotations",
    icon: QuranIcon,
  },
];

export function CollectionHub() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Collection</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--text-alpha-06)]">
              <Icon size={24} />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
