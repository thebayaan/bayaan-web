// Quran core types
export type {
  Verse,
  Surah,
  QuranData,
  Theme,
  SimilarAyah,
  MutashabihatMatch,
  MutashabihatPhrase,
} from './quran';

// Reciter types
export type { Reciter, Rewayat, RewayatStyle } from './reciter';

// Audio/Track types
export type { Track, TrackWithOptionalFields } from './audio';
export { ensureTrackFields } from './audio';

// Player types
export type {
  PlayerState,
  RepeatMode,
  PlaybackState,
  QueueState,
  LoadingState,
  ErrorState,
  PlaybackSettings,
  UIState,
  UnifiedPlayerState,
  PlayerAction,
  PlayerColors,
  CachedReciterColors,
} from './player';
export { CACHE_DURATION } from './player';

// Playlist types
export type { UserPlaylist, PlaylistItem } from './playlist';

// Verse annotation types (bookmarks, notes, highlights)
export type {
  HighlightColor,
  VerseBookmark,
  VerseNote,
  VerseHighlight,
} from './verse-annotations';
export { HIGHLIGHT_COLORS } from './verse-annotations';

// Adhkar types
export type {
  AdhkarBroadTag,
  AdhkarCategory,
  Dhikr,
  SavedDhikr,
  DhikrCount,
  SuperCategorySection,
  SuperCategory,
  AdhkarSeedData,
} from './adhkar';

// Ambient sound types
export type { AmbientSoundType, AmbientSoundMeta } from './ambient';
export {
  AMBIENT_SOUND_LIST,
  DEFAULT_AMBIENT_VOLUME,
  AMBIENT_FADE_DURATION,
  AMBIENT_FADE_STEP,
} from './ambient';

// Translation types
export type {
  BundledTranslationId,
  TranslationInfo,
  RemoteTranslationEdition,
  DownloadedTranslationMeta,
} from './translation';
export { BUNDLED_TRANSLATIONS } from './translation';

// Tafseer types
export type { TafseerEdition, DownloadedTafseerMeta } from './tafseer';

// Timestamp types
export type {
  AyahTimestamp,
  AyahTrackingState,
  TimestampSource,
  Mp3QuranAyahTiming,
  QdcAudioFileResponse,
  QdcAudioFile,
  QdcVerseTiming,
} from './timestamps';

// Changelog types
export type {
  ChangelogHighlight,
  ChangelogFullDetails,
  ChangelogEntry,
} from './changelog';
