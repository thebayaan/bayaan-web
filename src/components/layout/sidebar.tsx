"use client";

import { HomeIcon, QuranIcon, CollectionIcon, ProfileIcon, SettingsIcon } from "@/components/icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { ContinueReadingCard } from "./continue-reading-card";

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/reciters", icon: ProfileIcon, label: "Reciters" },
  // The Read Quran icon's artwork fills its viewBox edge-to-edge, so it
  // looks bigger than its neighbours at the same `size`. Render slightly smaller.
  { href: "/quran", icon: QuranIcon, label: "Read Quran", iconSize: 17 },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
] as const;

export function Sidebar() {
  return (
    <aside className="border-border bg-sidebar flex w-14 shrink-0 flex-col border-r sm:w-16 lg:w-60">
      <nav className="flex flex-col gap-1 px-2 pt-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-auto space-y-2 px-2 pb-4">
        <div className="px-1">
          <ContinueReadingCard />
        </div>
        <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
      </div>
    </aside>
  );
}
