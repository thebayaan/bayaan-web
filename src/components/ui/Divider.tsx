import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  className?: string;
  /** Orientation of the divider */
  orientation?: "horizontal" | "vertical";
}

/**
 * Divider — 1px hairline separator using the divider color token.
 *
 * Usage:
 *   <Divider />
 *   <Divider orientation="vertical" className="h-4" />
 */
export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <span
        className={cn("inline-block w-px self-stretch", className)}
        style={{ backgroundColor: "var(--color-divider)" }}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn("border-0 h-px w-full", className)}
      style={{ backgroundColor: "var(--color-divider)" }}
      {...props}
    />
  );
}
