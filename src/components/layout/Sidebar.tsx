"use client";

import { cn } from "@/lib/cn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Home,
  Search,
  Library,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Collection", href: "/collection", icon: Library },
  { label: "Mushaf", href: "/mushaf", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Sidebar — collapsible nav sidebar.
 * Collapses to icon-only at smaller widths or when toggled.
 */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col shrink-0",
        "border-r h-full",
        "transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[60px]" : "w-[220px]",
      )}
      style={{ borderColor: "var(--color-divider)" }}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center h-[60px] px-4 shrink-0",
          "border-b",
          collapsed ? "justify-center" : "justify-between",
        )}
        style={{ borderColor: "var(--color-divider)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Bayaan logomark — geometric star motif */}
            <BayaanMark size={28} />
            <span
              className="text-[15px] font-semibold tracking-tight whitespace-nowrap"
              style={{ color: "var(--color-text)" }}
            >
              Bayaan
            </span>
          </div>
        )}
        {collapsed && <BayaanMark size={28} />}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="px-2 pb-2 pt-1">
            <SectionHeader>Menu</SectionHeader>
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl",
                "text-sm font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
                collapsed ? "h-10 w-10 justify-center mx-auto" : "h-9 px-3",
                isActive
                  ? "bg-[var(--color-active-bg)] text-[var(--color-text)]"
                  : "text-[var(--color-icon)] hover:bg-[var(--color-hover)] hover:text-[var(--color-label)]",
              )}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="shrink-0"
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div
        className="p-2 border-t"
        style={{ borderColor: "var(--color-divider)" }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center gap-3 rounded-xl w-full",
            "text-sm font-medium",
            "h-9 px-3 transition-all duration-150",
            "text-[var(--color-icon)] hover:bg-[var(--color-hover)] hover:text-[var(--color-label)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
            collapsed && "justify-center px-0 w-10 mx-auto",
          )}
        >
          {collapsed ? (
            <ChevronRight size={16} strokeWidth={1.8} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={16} strokeWidth={1.8} className="shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ─── BayaanMark — SVG logomark ─────────────────────────────────────────────── */

function BayaanMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--color-text)"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />
      {/* Inner geometric — 8-pointed star fragment (crescent inspired) */}
      <path
        d="M14 4 C14 4 18 9 18 14 C18 17.5 16 20.5 14 22 C12 20.5 10 17.5 10 14 C10 9 14 4 14 4Z"
        fill="var(--color-text)"
        fillOpacity="0.9"
      />
      {/* Horizontal accent */}
      <path
        d="M6 14 C6 14 9.5 13 14 13 C18.5 13 22 14 22 14"
        stroke="var(--color-text)"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
