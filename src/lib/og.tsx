import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

export const OG_COLORS = {
  background: "#050b10",
  text: "#e8e8e8",
  muted: "#B0B0B0",
  accent: "#2dd4bf",
} as const;

async function loadManropeTTF(weight: "Regular" | "Bold"): Promise<ArrayBuffer> {
  const file = await readFile(path.join(process.cwd(), "public/fonts", `Manrope-${weight}.ttf`));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

export async function loadOgFonts() {
  const [regular, bold] = await Promise.all([loadManropeTTF("Regular"), loadManropeTTF("Bold")]);
  return [
    { name: "Manrope", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Manrope", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

interface OgCardOptions {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
}: OgCardOptions): Promise<ImageResponse> {
  const fonts = await loadOgFonts();

  const card: ReactElement = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: OG_COLORS.background,
        color: OG_COLORS.text,
        fontFamily: "Manrope",
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 700,
          color: OG_COLORS.accent,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 34, color: OG_COLORS.muted, lineHeight: 1.3 }}>{subtitle}</div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 700,
          color: OG_COLORS.text,
          letterSpacing: -1,
        }}
      >
        Bayaan
      </div>
    </div>
  );

  return new ImageResponse(card, { ...ogSize, fonts });
}
