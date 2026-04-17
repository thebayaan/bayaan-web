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
}

export function SidebarNavItem({ href, icon: Icon, label }: SidebarNavItemProps) {
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
      <Icon size={20} filled={isActive} />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
