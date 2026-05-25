"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    filled?: boolean;
  }>;
  label: string;
  /** Per-icon size override; defaults to 20. Use for icons whose artwork
   * fills the viewBox edge-to-edge and looks heavier than their neighbours. */
  iconSize?: number;
}

export function SidebarNavItem({ href, icon: Icon, label, iconSize = 20 }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "duration-fast ease-standard flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-brand-light text-brand-main font-semibold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        <Icon size={iconSize} filled={isActive} />
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
