"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

function Sheet({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} modal swipeDirection="right">
      {children}
    </DrawerPrimitive.Root>
  );
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <DrawerPrimitive.Portal>{children}</DrawerPrimitive.Portal>;
}

function SheetBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

type SheetSide = "right" | "bottom";

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup> & { side?: SheetSide }) {
  const sideClasses =
    side === "bottom"
      ? [
          "fixed inset-x-0 bottom-0 z-50 h-auto max-h-[85vh]",
          "border-border bg-background rounded-t-2xl border-t shadow-xl",
          "data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
        ]
      : [
          "fixed top-0 right-0 bottom-0 z-50 h-full",
          "border-border bg-background border-l shadow-xl",
          "data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        ];
  return (
    <SheetPortal>
      <SheetBackdrop />
      <DrawerPrimitive.Viewport>
        <DrawerPrimitive.Popup
          className={cn(...sideClasses, "transition-transform duration-300 ease-in-out", className)}
          {...props}
        >
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("text-lg leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function SheetClose({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetBackdrop,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
};
