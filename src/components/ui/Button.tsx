import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-xl font-semibold text-sm",
    "transition-all duration-150",
    "cursor-pointer select-none",
    "disabled:opacity-40 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2",
  ],
  {
    variants: {
      variant: {
        /**
         * Primary — solid text-color background with background-color text.
         * The most prominent action on the surface.
         */
        primary: [
          "text-[var(--color-background)]",
          "bg-[var(--color-text)]",
          "hover:opacity-90 active:opacity-75",
          "focus-visible:ring-[var(--color-text)]",
        ],
        /**
         * Secondary — subtle alpha background. Lower hierarchy action.
         */
        secondary: [
          "text-[var(--color-label)]",
          "bg-[var(--color-card-bg)]",
          "border border-[var(--color-card-border)]",
          "hover:bg-[var(--color-hover)]",
          "active:bg-[var(--color-secondary-bg)]",
          "focus-visible:ring-[var(--color-text)]",
        ],
        /**
         * Ghost — no background, minimal chrome.
         */
        ghost: [
          "text-[var(--color-icon)]",
          "hover:bg-[var(--color-hover)]",
          "hover:text-[var(--color-label)]",
          "active:bg-[var(--color-secondary-bg)]",
          "focus-visible:ring-[var(--color-text)]",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

/**
 * Button — primary, secondary, and ghost variants via CVA.
 *
 * Usage:
 *   <Button>Play</Button>
 *   <Button variant="secondary" size="sm">Settings</Button>
 *   <Button variant="ghost">Cancel</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
