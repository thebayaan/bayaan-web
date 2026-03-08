export interface TafseerEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  authorName?: string;
  format: string;
  type: string;
  direction: 'ltr' | 'rtl';
}

export interface DownloadedTafseerMeta {
  identifier: string;
  name: string;
  englishName: string;
  language: string;
  direction: 'ltr' | 'rtl';
  downloadedAt: number;
  verseCount: number;
  authorName?: string;
}
