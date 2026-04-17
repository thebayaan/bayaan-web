"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlaylists } from "@/hooks/use-playlists";
import { useFavoriteReciters } from "@/hooks/use-favorites";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useNotes } from "@/hooks/use-notes";

interface CollectionItem {
  href: string;
  label: string;
  emptyText: string;
  icon: ReactNode;
  color: string;
  count: number;
}

function ChevronRight() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="text-muted-foreground shrink-0"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/* Icons ported from mobile's components/Icons.tsx with exact SVG paths */

function PlaylistIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.94358 3.25H14.0564C15.8942 3.24998 17.3498 3.24997 18.489 3.40314C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33856 22.5969 7.51098C22.75 8.65019 22.75 10.1058 22.75 11.9436V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.6104 20.1071 19.6614 20.4392 18.489 20.5969C17.3498 20.75 15.8942 20.75 14.0564 20.75H9.94359C8.10583 20.75 6.65019 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10582 3.24998 9.94358 3.25ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.75159 8.73851 2.75 10.0932 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H14C15.9068 19.25 17.2615 19.2484 18.2892 19.1102C19.2952 18.975 19.8749 18.7213 20.2981 18.2981C20.7213 17.8749 20.975 17.2952 21.1102 16.2892C21.2484 15.2615 21.25 13.9068 21.25 12C21.25 10.0932 21.2484 8.73851 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C18.247 4.88409 18.2043 4.87865 18.161 4.87343L17.6614 6.2056C17.4381 6.80114 17.2492 7.30505 17.0482 7.70092C16.8345 8.12192 16.5764 8.48586 16.1804 8.7603C15.7844 9.03473 15.353 9.14857 14.8838 9.20087C14.4425 9.25004 13.9044 9.25002 13.2684 9.25H10.7316C10.0956 9.25002 9.55747 9.25004 9.11624 9.20087C8.647 9.14857 8.21562 9.03473 7.81962 8.7603C7.42361 8.48586 7.16555 8.12192 6.95182 7.70092C6.75085 7.30506 6.56191 6.80116 6.33862 6.20565L5.83904 4.87343C5.79575 4.87865 5.75302 4.88409 5.71085 4.88976ZM7.40276 4.77136L7.72893 5.64115C7.97023 6.28461 8.13066 6.70936 8.28934 7.02191C8.43949 7.31769 8.55609 7.44569 8.67401 7.52741C8.79193 7.60912 8.95272 7.67336 9.28238 7.7101C9.63075 7.74892 10.0848 7.75 10.772 7.75H13.228C13.9152 7.75 14.3692 7.74892 14.7176 7.7101C15.0473 7.67336 15.2081 7.60912 15.326 7.52741C15.4439 7.44569 15.5605 7.31769 15.7107 7.02191C15.8693 6.70936 16.0298 6.28461 16.2711 5.64115L16.5972 4.77136C15.8639 4.75045 15.0093 4.75 14 4.75H10C8.99068 4.75 8.13606 4.75045 7.40276 4.77136ZM5.25 13.75C5.25 12.0931 6.59315 10.75 8.25 10.75C8.30598 10.75 8.3616 10.7515 8.41682 10.7546C8.44413 10.7515 8.47189 10.75 8.5 10.75H16C16.0852 10.75 16.1671 10.7642 16.2434 10.7904C17.6655 11.0257 18.75 12.2612 18.75 13.75C18.75 15.2388 17.6655 16.4743 16.2434 16.7096C16.1671 16.7358 16.0852 16.75 16 16.75H8.5C8.47189 16.75 8.44413 16.7485 8.41682 16.7454C8.3616 16.7485 8.30598 16.75 8.25 16.75C6.59315 16.75 5.25 15.4069 5.25 13.75ZM10.8487 15.25H13.1513C12.8961 14.8087 12.75 14.2964 12.75 13.75C12.75 13.2036 12.8961 12.6913 13.1513 12.25H10.8487C11.1039 12.6913 11.25 13.2036 11.25 13.75C11.25 14.2964 11.1039 14.8087 10.8487 15.25ZM15.75 15.25C16.5784 15.25 17.25 14.5784 17.25 13.75C17.25 12.9216 16.5784 12.25 15.75 12.25C14.9216 12.25 14.25 12.9216 14.25 13.75C14.25 14.5784 14.9216 15.25 15.75 15.25ZM8.25 12.25C7.42157 12.25 6.75 12.9216 6.75 13.75C6.75 14.5784 7.42157 15.25 8.25 15.25C9.07843 15.25 9.75 14.5784 9.75 13.75C9.75 12.9216 9.07843 12.25 8.25 12.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 18C4 15.79 5.79 14 8 14H16C18.21 14 20 15.79 20 18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18Z" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5.95q0.06 0 0.07-0.01c1.75-2.18 5.25-3.94 7.46-1.13 0.97 1.24 0.83 2.98 0.3 4.42-1.19 3.24-4.22 6.13-7.34 7.52q-0.17 0.08-0.48 0.08t-0.48-0.08c-3.12-1.38-6.15-4.28-7.34-7.52c-0.53-1.44-0.67-3.18 0.3-4.42 2.21-2.81 5.71-1.05 7.46 1.13q0.01 0.01 0.07 0.01z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 12L12 16M12 16L16 12M12 16V8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" />
      <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" />
      <path d="M12 19V23M8 23H16" />
    </svg>
  );
}

export function CollectionHub() {
  const { playlists } = usePlaylists();
  const { favoriteReciters } = useFavoriteReciters();
  const { bookmarks } = useBookmarks();
  const { notes } = useNotes();

  const items: CollectionItem[] = [
    {
      href: "/collection/playlists",
      label: "Playlists",
      emptyText: "Create your first playlist",
      color: "#6366F1",
      count: playlists.length,
      icon: <PlaylistIcon />,
    },
    {
      href: "/collection/favorites",
      label: "Reciters",
      emptyText: "No favorites yet",
      color: "#3B82F6",
      count: favoriteReciters.length,
      icon: <ProfileIcon />,
    },
    {
      href: "/collection/favorites",
      label: "Loved",
      emptyText: "No loved surahs yet",
      color: "#FF6B6B",
      count: 0,
      icon: <HeartFilledIcon />,
    },
    {
      href: "/collection/bookmarks",
      label: "Bookmarks",
      emptyText: "No bookmarks yet",
      color: "#F59E0B",
      count: bookmarks.length,
      icon: <BookmarkIcon />,
    },
    {
      href: "/collection/notes",
      label: "Notes",
      emptyText: "No notes yet",
      color: "#3B82F6",
      count: notes.length,
      icon: <FileTextIcon />,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Collection</h1>
      <div className="divide-y divide-[var(--text-alpha-06)]">
        {items.map(({ href, label, emptyText, icon, color, count }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-md py-3 transition-colors hover:bg-[var(--text-alpha-04)]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: color + "26", color }}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">{label}</p>
              <p className="text-muted-foreground text-xs">
                {count > 0 ? `${count} ${count === 1 ? "item" : "items"}` : emptyText}
              </p>
            </div>
            <ChevronRight />
          </Link>
        ))}
      </div>
    </div>
  );
}
