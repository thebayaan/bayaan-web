import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

export type OgTheme = "dark" | "light";

// Palette keyed by theme. The CDN images are the visual hero; these
// tokens only dress the title/subtitle/eyebrow overlay so they stay
// legible against whichever variant we loaded.
export const OG_COLORS = {
  dark: {
    eyebrow: "#ffffff",
    title: "#ffffff",
    subtitle: "rgba(255,255,255,0.78)",
    wordmark: "#ffffff",
    gradient: "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.97) 100%)",
    fallbackBackground: "#050b10",
  },
  light: {
    eyebrow: "#171717",
    title: "#171717",
    subtitle: "rgba(23,23,23,0.72)",
    wordmark: "#171717",
    gradient:
      "linear-gradient(rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.95) 100%)",
    fallbackBackground: "#f8f7f5",
  },
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
  // When provided, rendered as a full-bleed background with a gradient
  // overlay so the text remains readable. Omit for the flat fallback
  // layout (used for the root OG where no hero image exists).
  backgroundImage?: string;
  theme?: OgTheme;
}

export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  theme = "dark",
}: OgCardOptions): Promise<ImageResponse> {
  const fonts = await loadOgFonts();
  const palette = OG_COLORS[theme];

  const card: ReactElement = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: palette.fallbackBackground,
        color: palette.title,
        fontFamily: "Manrope",
        overflow: "hidden",
      }}
    >
      {backgroundImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}

      {backgroundImage ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "70%",
            display: "flex",
            background: palette.gradient,
          }}
        />
      ) : null}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            color: palette.eyebrow,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: palette.title,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 32,
                color: palette.subtitle,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            color: palette.wordmark,
            letterSpacing: -1,
          }}
        >
          Bayaan
        </div>
      </div>
    </div>
  );

  return new ImageResponse(card, { ...ogSize, fonts });
}

// ── CDN image helpers ────────────────────────────────────────────────
//
// The backgrounds live on Cloudflare at two known paths. Each has a
// dark default and a `-light` suffix; for surah OG images the dark
// variant has no suffix at all.

const CDN = "https://cdn.thebayaan.com";

export function surahOgBackground(surahId: number, theme: OgTheme): string {
  return theme === "light"
    ? `${CDN}/assets/og-images/surah/${surahId}-light.png`
    : `${CDN}/assets/og-images/surah/${surahId}.png`;
}

export function adhkarOgBackground(superId: string, theme: OgTheme): string {
  return `${CDN}/assets/images/adhkar/${superId}-${theme}.png`;
}
