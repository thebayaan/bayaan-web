export interface Translation {
  id: string;
  name: string;
  author: string;
  language: string;
  direction: 'ltr' | 'rtl';
}

export interface TranslationVerse {
  verse_key: string;
  text: string;
  resource_id?: number;
}

export interface TranslationData {
  id: string;
  name: string;
  author: string;
  language: string;
  direction: 'ltr' | 'rtl';
  verses: TranslationVerse[];
}

export type TranslationPosition = 'below' | 'side';
export type FontSize = 'small' | 'medium' | 'large';
