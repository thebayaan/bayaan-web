"use client";

import type { KeyboardEvent } from "react";

/**
 * Returns a KeyboardEvent handler for a role=menu container that moves
 * focus between its menuitem children with ArrowUp/ArrowDown/Home/End,
 * matching the ARIA Authoring Practices Guide menu pattern.
 *
 * Mount on the `<div role="menu">` element. Children must carry a
 * `role` attribute starting with `menuitem` (covers `menuitem`,
 * `menuitemradio`, `menuitemcheckbox`).
 */
export function useMenuKeyboardNav(): (e: KeyboardEvent<HTMLDivElement>) => void {
  return (e) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
    ).filter((el) => !el.hasAttribute("disabled"));
    if (items.length === 0) return;
    e.preventDefault();
    const active = document.activeElement as HTMLElement | null;
    const idx = active ? items.indexOf(active) : -1;
    let next = 0;
    if (e.key === "ArrowDown") {
      next = idx >= 0 ? (idx + 1) % items.length : 0;
    } else if (e.key === "ArrowUp") {
      next = idx > 0 ? idx - 1 : items.length - 1;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = items.length - 1;
    }
    items[next]?.focus();
  };
}
