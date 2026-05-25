"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MUSHAF_PAGE_WIDTH_PX } from "./mushaf-layout";

interface MushafPageScalerProps {
  scale: number;
  children: ReactNode;
}

/** Zoom a fixed-width mushaf page without changing glyph font-size. */
export function MushafPageScaler({ scale, children }: MushafPageScalerProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    const updateHeight = () => setScaledHeight(node.offsetHeight * scale);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [scale, children]);

  if (Math.abs(scale - 1) < 0.001) {
    return <>{children}</>;
  }

  return (
    <div
      className="mx-auto"
      style={{
        width: MUSHAF_PAGE_WIDTH_PX * scale,
        height: scaledHeight,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: MUSHAF_PAGE_WIDTH_PX,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
