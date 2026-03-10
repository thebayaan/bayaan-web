"use client";

import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { Sun, Moon, Keyboard } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { getModifierKey } from "@/hooks/useKeyboardShortcuts";

interface TopBarProps {
  onShowShortcutsHelp?: () => void;
}

/**
 * TopBar — App header with search, theme indicator, and keyboard shortcuts help.
 * Rendered on the client for theme detection and navigation.
 */
export function TopBar({ onShowShortcutsHelp }: TopBarProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleSearchShortcut = () => {
    router.push("/search");
  };

  return (
    <header
      className={cn(
        "flex items-center gap-4 px-5",
        "h-[60px] shrink-0",
        "border-b",
      )}
      style={{ borderColor: "var(--color-divider)" }}
    >
      {/* Search — takes up available space */}
      <div className="flex-1 max-w-md">
        <SearchInput
          placeholder="Search reciters, surahs, adhkar…"
          showShortcut
          onShortcutPress={handleSearchShortcut}
          aria-label="Search"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Keyboard shortcuts help */}
        {onShowShortcutsHelp && (
          <IconButton
            label={`Keyboard shortcuts (${getModifierKey()} + ?)`}
            size="md"
            onClick={onShowShortcutsHelp}
          >
            <Keyboard size={16} strokeWidth={1.8} />
          </IconButton>
        )}

        {/* Theme indicator — display only, system theme is auto */}
        <IconButton
          label={theme === "dark" ? "Dark mode active" : "Light mode active"}
          size="md"
          className="opacity-60 cursor-default pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {theme === "dark" ? (
            <Moon size={16} strokeWidth={1.8} />
          ) : (
            <Sun size={16} strokeWidth={1.8} />
          )}
        </IconButton>
      </div>
    </header>
  );
}
