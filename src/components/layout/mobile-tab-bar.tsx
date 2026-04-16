"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, QuranIcon, CollectionIcon, SettingsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: SearchIcon, label: "Search" },
  { href: "/quran", icon: QuranIcon, label: "Read" },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="border-border bg-background/90 fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {TABS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon size={20} filled={isActive} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
