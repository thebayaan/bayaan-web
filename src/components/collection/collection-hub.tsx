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
      <h1 className="text-3xl font-bold mb-6">Your Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--text-alpha-04)] hover:bg-[var(--text-alpha-06)] transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--text-alpha-06)] flex items-center justify-center shrink-0">
              <Icon size={24} />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
