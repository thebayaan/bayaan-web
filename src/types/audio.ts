export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
  reciterId: string;
  reciterName: string;
  surahId?: string;
  rewayatId?: string;
}

export type TrackWithOptionalFields = Partial<Track>;

export function ensureTrackFields(track: TrackWithOptionalFields): Track {
  return {
    id: track.id || '',
    url: track.url || '',
    title: track.title || '',
    artist: track.artist || '',
    artwork: track.artwork || '',
    duration: track.duration,
    reciterId: track.reciterId || '',
    reciterName: track.reciterName || '',
    surahId: track.surahId,
    rewayatId: track.rewayatId,
  };
}
