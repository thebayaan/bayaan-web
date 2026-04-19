// Helpers that compose the Cloudflare CDN URLs for our pre-rendered OG
// hero images. We point `og:image` straight at these so the preview
// card is just the artwork — the title/description shown next to it
// come from the `og:title` / `og:description` meta tags.

export type OgTheme = "dark" | "light";

const CDN = "https://cdn.thebayaan.com";

// Surah OG images: the dark variant has no suffix, the light variant
// uses `-light`. Published for all 114 surahs.
export function surahOgBackground(surahId: number, theme: OgTheme): string {
  return theme === "light"
    ? `${CDN}/assets/og-images/surah/${surahId}-light.png`
    : `${CDN}/assets/og-images/surah/${surahId}.png`;
}

// Adhkar super-category OG images. Both `-dark` and `-light` exist,
// keyed by the super-category slug (e.g. `morning-adhkar`).
export function adhkarOgBackground(superSlug: string, theme: OgTheme): string {
  return `${CDN}/assets/images/adhkar/${superSlug}-${theme}.png`;
}
