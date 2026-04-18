const OG_BASE = `${process.env.NEXT_PUBLIC_BAYAAN_API_URL ?? "https://api.thebayaan.com"}/og`;

export const ogRootUrl = (): string => `${OG_BASE}/root.png`;

export const ogVerseUrl = (s: number, a: number): string => `${OG_BASE}/verse/${s}/${a}.png`;

export const ogSurahUrl = (s: number): string => `${OG_BASE}/surah/${s}.png`;

export const ogReciterUrl = (slug: string): string => `${OG_BASE}/reciter/${slug}.png`;

export const ogRecitationUrl = (slug: string, surah: number, rewayah?: string): string =>
  rewayah
    ? `${OG_BASE}/recitation/${slug}/${surah}.png?rewayah=${rewayah}`
    : `${OG_BASE}/recitation/${slug}/${surah}.png`;

export const ogMushafUrl = (page: number): string => `${OG_BASE}/mushaf/${page}.png`;

export const ogAdhkarUrl = (id: string): string => `${OG_BASE}/adhkar/${id}.png`;

export const ogDhikrUrl = (sid: string, did: string): string =>
  `${OG_BASE}/dhikr/${sid}/${did}.png`;
