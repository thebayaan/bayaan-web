"use client";

import {
  LogoIcon,
  HomeIcon,
  SearchIcon,
  QuranIcon,
  CollectionIcon,
  SettingsIcon,
} from "@/components/icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: SearchIcon, label: "Search" },
  { href: "/quran", icon: QuranIcon, label: "Read Quran" },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
] as const;

export function Sidebar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isDark = getResolvedTheme(themeMode) === "dark";

  return (
    <aside className="border-border bg-sidebar hidden w-16 shrink-0 flex-col border-r md:flex lg:w-60">
      <div className="flex items-center gap-2 px-4 py-5">
        <LogoIcon size={28} isDarkMode={isDark} />
        <span className="hidden text-lg font-bold lg:inline">Bayaan</span>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-auto space-y-2 px-2 pb-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
          <span className="text-muted-foreground hidden text-sm lg:inline">Account</span>
        </div>
        <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
      </div>
    </aside>
  );
}
