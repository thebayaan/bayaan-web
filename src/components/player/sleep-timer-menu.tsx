"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { useMenuKeyboardNav } from "@/hooks/use-menu-keyboard-nav";
import { TimerIcon } from "@/components/icons";

const PRESET_MINUTES = [15, 30, 45, 60] as const;

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface SleepTimerMenuProps {
  remainingMs: number | null;
  className?: string;
}

export function SleepTimerMenu({ remainingMs, className }: SleepTimerMenuProps) {
  const minutes = usePlayerStore((s) => s.settings.sleepTimerMinutes);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleMenuKey = useMenuKeyboardNav();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // ARIA APG: opening a menu focuses the active (checked) option, or the
  // first item, so ArrowUp/ArrowDown have a starting point.
  useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not([disabled])',
    );
    if (!items || items.length === 0) return;
    const checked = Array.from(items).find((el) => el.getAttribute("aria-checked") === "true");
    (checked ?? items[0])?.focus();
  }, [open]);

  const isActive = minutes !== null;
  const remainingLabel = remainingMs !== null ? formatRemaining(remainingMs) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isActive ? `Sleep timer (${remainingLabel} remaining)` : "Set sleep timer"}
        onClick={() => setOpen((v) => !v)}
        className={
          className ??
          `duration-fast ease-standard flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            isActive ? "text-brand-main" : "text-muted-foreground hover:text-foreground"
          }`
        }
      >
        <TimerIcon size={16} aria-hidden="true" />
        {isActive && remainingLabel ? <span className="tabular-nums">{remainingLabel}</span> : null}
      </button>
      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            aria-label="Sleep timer"
            onKeyDown={handleMenuKey}
            className="border-border bg-background absolute right-0 bottom-full z-20 mb-2 w-40 rounded-lg border p-1 shadow-xl"
          >
            <button
              role="menuitemradio"
              type="button"
              onClick={() => {
                setSleepTimer(null);
                setOpen(false);
              }}
              aria-checked={!isActive}
              className={`hover:bg-surface-raised flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                !isActive ? "text-brand-main font-semibold" : ""
              }`}
            >
              <span>Off</span>
              {!isActive ? <span aria-hidden="true">✓</span> : null}
            </button>
            {PRESET_MINUTES.map((m) => {
              const active = minutes === m;
              return (
                <button
                  key={m}
                  role="menuitemradio"
                  type="button"
                  onClick={() => {
                    setSleepTimer(m);
                    setOpen(false);
                  }}
                  aria-checked={active}
                  className={`hover:bg-surface-raised flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active ? "text-brand-main font-semibold" : ""
                  }`}
                >
                  <span>{m} minutes</span>
                  {active ? <span aria-hidden="true">✓</span> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
