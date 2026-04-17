import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy
      className={cn("bg-surface-sunken animate-skeleton-pulse rounded-md", className)}
      {...props}
    />
  );
}
