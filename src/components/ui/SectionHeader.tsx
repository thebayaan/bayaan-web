import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

interface SectionHeaderProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

/**
 * SectionHeader — ALL CAPS label using the section-header color token.
 * Matches the design system spec: Manrope SemiBold, ~10.5px, letter-spacing 1.2.
 *
 * Usage:
 *   <SectionHeader>Recently Played</SectionHeader>
 */
export function SectionHeader({
  className,
  children,
  ...props
}: SectionHeaderProps) {
  return (
    <p
      className={cn(
        "text-[10.5px] font-semibold uppercase tracking-[1.2px]",
        "font-manrope",
        className,
      )}
      style={{ color: "var(--color-section-header)" }}
      {...props}
    >
      {children}
    </p>
  );
}
