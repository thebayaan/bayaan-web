import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  /** Accessible label — required for screen readers */
  label: string;
  /** Visual size of the button */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

/**
 * IconButton — round icon-only button with hover state.
 *
 * Usage:
 *   <IconButton label="Play">
 *     <PlayIcon size={16} />
 *   </IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "text-[var(--color-icon)]",
          "hover:bg-[var(--color-hover)] hover:text-[var(--color-label)]",
          "active:bg-[var(--color-secondary-bg)]",
          "transition-all duration-150",
          "cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
