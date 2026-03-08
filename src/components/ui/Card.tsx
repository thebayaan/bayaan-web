import { cn } from "@/lib/cn";
import { type ElementType, type HTMLAttributes } from "react";

type CardAs = "div" | "section" | "article";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardAs;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Card — alpha-based surface container.
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card as="section" className="p-6">...</Card>
 */
export function Card({ as, className, children, ...props }: CardProps) {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      className={cn("rounded-2xl border overflow-hidden", className)}
      style={{
        backgroundColor: "var(--color-card-bg)",
        borderColor: "var(--color-card-border)",
        ...((props as { style?: React.CSSProperties }).style ?? {}),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
