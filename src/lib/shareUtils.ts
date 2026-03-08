import type { Verse } from "@/types/quran";

interface ShareVerseOptions {
  verse: Verse;
  surahName?: string;
  includeArabic?: boolean;
  includeTranslation?: string;
}

interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'fallback';
  error?: string;
}

/**
 * Shares a Quranic verse using the most appropriate method available
 * 1. Web Share API (if supported)
 * 2. Clipboard API
 * 3. Fallback selection method
 */
export async function shareVerse({
  verse,
  surahName,
  includeArabic = true,
  includeTranslation
}: ShareVerseOptions): Promise<ShareResult> {
  try {
    // Build the share text
    const shareText = buildShareText({
      verse,
      surahName,
      includeArabic,
      includeTranslation
    });

    const shareData = {
      title: `Quran ${verse.verse_key}`,
      text: shareText,
      url: `${window.location.origin}/mushaf/${verse.surah_number}#verse-${verse.ayah_number}`
    };

    // Try Web Share API first (mobile/supported browsers)
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    }

    // Fallback to Clipboard API
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    }

    // Last resort: Select text for manual copy
    createTemporaryTextSelection(shareText);
    return { success: true, method: 'fallback' };

  } catch (error) {
    console.error('Share failed:', error);
    return {
      success: false,
      method: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Copies verse text to clipboard
 */
export async function copyVerse(verse: Verse): Promise<ShareResult> {
  try {
    const text = verse.text;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    }

    // Fallback selection
    createTemporaryTextSelection(text);
    return { success: true, method: 'fallback' };

  } catch (error) {
    return {
      success: false,
      method: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Builds formatted text for sharing
 */
function buildShareText({
  verse,
  surahName,
  includeArabic,
  includeTranslation
}: ShareVerseOptions): string {
  const parts: string[] = [];

  // Arabic text
  if (includeArabic) {
    parts.push(verse.text);
  }

  // Translation if provided
  if (includeTranslation) {
    parts.push(`\n"${includeTranslation}"`);
  }

  // Reference
  const reference = surahName
    ? `— ${surahName} ${verse.verse_key}`
    : `— Quran ${verse.verse_key}`;

  parts.push(`\n${reference}`);

  // App attribution
  parts.push('\n\n📖 Shared via Bayaan');

  return parts.join('');
}

/**
 * Creates temporary text selection for manual copy (fallback)
 */
function createTemporaryTextSelection(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();

  // Try the deprecated execCommand as final fallback
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('execCommand copy failed:', err);
  }

  document.body.removeChild(textArea);
}

/**
 * Formats verse for copying (Arabic only)
 */
export function formatVerseForCopy(verse: Verse): string {
  return `${verse.text} — ${verse.verse_key}`;
}