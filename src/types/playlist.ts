export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  surahId: string;
  reciterId: string;
  rewayatId?: string;
  orderIndex: number;
  addedAt: number;
}
