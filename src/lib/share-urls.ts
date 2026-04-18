const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com";

export function verseShareUrl(surah: number, ayah: number): string {
  return `${BASE}/quran/${surah}/${ayah}`;
}

export function surahShareUrl(surah: number, ayah?: number): string {
  return ayah ? `${BASE}/quran/${surah}?v=${ayah}` : `${BASE}/quran/${surah}`;
}

export function reciterShareUrl(slug: string): string {
  return `${BASE}/reciter/${slug}`;
}

export function recitationShareUrl(
  slug: string,
  surahNum: number,
  opts?: { rewayah?: string; tSec?: number },
): string {
  const params = new URLSearchParams();
  if (opts?.rewayah) params.set("rewayah", opts.rewayah);
  if (opts?.tSec) params.set("t", String(opts.tSec));
  const q = params.toString();
  return `${BASE}/reciter/${slug}/${surahNum}${q ? `?${q}` : ""}`;
}

export function mushafShareUrl(page: number, theme?: "light"): string {
  return theme === "light" ? `${BASE}/mushaf/${page}?theme=light` : `${BASE}/mushaf/${page}`;
}

export function adhkarShareUrl(superId: string): string {
  return `${BASE}/adhkar/${superId}`;
}

export function dhikrShareUrl(superId: string, dhikrId: string): string {
  return `${BASE}/adhkar/${superId}/${dhikrId}`;
}
