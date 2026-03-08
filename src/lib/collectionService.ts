import { UserPlaylist, PlaylistItem } from '@/types/playlist';
import { VerseBookmark, VerseNote, VerseHighlight, HighlightColor } from '@/types/verse-annotations';

// IndexedDB Configuration
const DB_NAME = 'BayaanCollection';
const DB_VERSION = 1;

// Object Stores
const PLAYLISTS_STORE = 'playlists';
const PLAYLIST_ITEMS_STORE = 'playlist_items';
const VERSE_BOOKMARKS_STORE = 'verse_bookmarks';
const VERSE_NOTES_STORE = 'verse_notes';
const VERSE_HIGHLIGHTS_STORE = 'verse_highlights';

class CollectionDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create playlists store
        if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
          const playlistStore = db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' });
          playlistStore.createIndex('name', 'name', { unique: false });
          playlistStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create playlist items store
        if (!db.objectStoreNames.contains(PLAYLIST_ITEMS_STORE)) {
          const itemsStore = db.createObjectStore(PLAYLIST_ITEMS_STORE, { keyPath: 'id' });
          itemsStore.createIndex('playlistId', 'playlistId', { unique: false });
          itemsStore.createIndex('orderIndex', 'orderIndex', { unique: false });
        }

        // Create verse bookmarks store
        if (!db.objectStoreNames.contains(VERSE_BOOKMARKS_STORE)) {
          const bookmarksStore = db.createObjectStore(VERSE_BOOKMARKS_STORE, { keyPath: 'id' });
          bookmarksStore.createIndex('verseKey', 'verseKey', { unique: true });
          bookmarksStore.createIndex('surahNumber', 'surahNumber', { unique: false });
          bookmarksStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create verse notes store
        if (!db.objectStoreNames.contains(VERSE_NOTES_STORE)) {
          const notesStore = db.createObjectStore(VERSE_NOTES_STORE, { keyPath: 'id' });
          notesStore.createIndex('verseKey', 'verseKey', { unique: false });
          notesStore.createIndex('surahNumber', 'surahNumber', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create verse highlights store
        if (!db.objectStoreNames.contains(VERSE_HIGHLIGHTS_STORE)) {
          const highlightsStore = db.createObjectStore(VERSE_HIGHLIGHTS_STORE, { keyPath: 'id' });
          highlightsStore.createIndex('verseKey', 'verseKey', { unique: true });
          highlightsStore.createIndex('surahNumber', 'surahNumber', { unique: false });
          highlightsStore.createIndex('color', 'color', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  async transaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    callback: (stores: IDBObjectStore | IDBObjectStore[]) => Promise<T>
  ): Promise<T> {
    const db = await this.ensureDB();
    const transaction = db.transaction(storeNames, mode);

    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));

      const stores = Array.isArray(storeNames)
        ? storeNames.map(name => transaction.objectStore(name))
        : transaction.objectStore(storeNames);

      callback(stores).then(resolve).catch(reject);
    });
  }
}

// Singleton database instance
const collectionDB = new CollectionDatabase();

// Playlist Service
export class PlaylistService {
  private generateId(): string {
    return `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAllPlaylists(): Promise<UserPlaylist[]> {
    return collectionDB.transaction(PLAYLISTS_STORE, 'readonly', async (store) => {
      return new Promise<UserPlaylist[]>((resolve, reject) => {
        const request = (store as IDBObjectStore).getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async getPlaylist(id: string): Promise<UserPlaylist | null> {
    return collectionDB.transaction(PLAYLISTS_STORE, 'readonly', async (store) => {
      return new Promise<UserPlaylist | null>((resolve, reject) => {
        const request = (store as IDBObjectStore).get(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  async createPlaylist(name: string, color: string, description?: string): Promise<UserPlaylist> {
    const playlist: UserPlaylist = {
      id: this.generateId(),
      name,
      description,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      itemCount: 0,
    };

    await collectionDB.transaction(PLAYLISTS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(playlist);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<UserPlaylist>): Promise<UserPlaylist | null> {
    const existing = await this.getPlaylist(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await collectionDB.transaction(PLAYLISTS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).put(updated);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    return updated;
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    await collectionDB.transaction([PLAYLISTS_STORE, PLAYLIST_ITEMS_STORE], 'readwrite', async (stores) => {
      const [playlistStore, itemsStore] = stores as IDBObjectStore[];

      // Delete the playlist
      await new Promise<void>((resolve, reject) => {
        const request = playlistStore.delete(playlistId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Delete all items in the playlist
      await new Promise<void>((resolve, reject) => {
        const index = itemsStore.index('playlistId');
        const request = index.openCursor(IDBKeyRange.only(playlistId));

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
    });
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return collectionDB.transaction(PLAYLIST_ITEMS_STORE, 'readonly', async (store) => {
      return new Promise<PlaylistItem[]>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('playlistId');
        const request = index.getAll(IDBKeyRange.only(playlistId));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const items = request.result;
          items.sort((a, b) => a.orderIndex - b.orderIndex);
          resolve(items);
        };
      });
    });
  }

  async addToPlaylist(
    playlistId: string,
    surahId: string,
    reciterId: string,
    rewayatId?: string
  ): Promise<void> {
    const existingItems = await this.getPlaylistItems(playlistId);
    const orderIndex = existingItems.length;

    const item: PlaylistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playlistId,
      surahId,
      reciterId,
      rewayatId,
      orderIndex,
      addedAt: Date.now(),
    };

    await collectionDB.transaction([PLAYLIST_ITEMS_STORE, PLAYLISTS_STORE], 'readwrite', async (stores) => {
      const [itemsStore, playlistStore] = stores as IDBObjectStore[];

      // Add the item
      await new Promise<void>((resolve, reject) => {
        const request = itemsStore.add(item);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Update playlist item count
      const playlist = await new Promise<UserPlaylist>((resolve, reject) => {
        const request = playlistStore.get(playlistId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (playlist) {
        playlist.itemCount = existingItems.length + 1;
        playlist.updatedAt = Date.now();

        await new Promise<void>((resolve, reject) => {
          const request = playlistStore.put(playlist);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      }
    });
  }

  async removeFromPlaylist(itemId: string): Promise<void> {
    // Get the item to find playlist ID
    const item = await collectionDB.transaction(PLAYLIST_ITEMS_STORE, 'readonly', async (store) => {
      return new Promise<PlaylistItem | null>((resolve, reject) => {
        const request = (store as IDBObjectStore).get(itemId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    });

    if (!item) return;

    await collectionDB.transaction([PLAYLIST_ITEMS_STORE, PLAYLISTS_STORE], 'readwrite', async (stores) => {
      const [itemsStore, playlistStore] = stores as IDBObjectStore[];

      // Delete the item
      await new Promise<void>((resolve, reject) => {
        const request = itemsStore.delete(itemId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Update playlist item count
      const playlist = await new Promise<UserPlaylist>((resolve, reject) => {
        const request = playlistStore.get(item.playlistId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (playlist) {
        playlist.itemCount = Math.max(0, playlist.itemCount - 1);
        playlist.updatedAt = Date.now();

        await new Promise<void>((resolve, reject) => {
          const request = playlistStore.put(playlist);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      }
    });
  }

  async reorderPlaylistItems(playlistId: string, itemIds: string[]): Promise<void> {
    await collectionDB.transaction(PLAYLIST_ITEMS_STORE, 'readwrite', async (store) => {
      // Get all items
      const items = await new Promise<PlaylistItem[]>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('playlistId');
        const request = index.getAll(IDBKeyRange.only(playlistId));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      // Update order indexes
      const itemsMap = new Map(items.map(item => [item.id, item]));
      const promises: Promise<void>[] = [];

      itemIds.forEach((id, index) => {
        const item = itemsMap.get(id);
        if (item) {
          item.orderIndex = index;
          promises.push(
            new Promise<void>((resolve, reject) => {
              const request = (store as IDBObjectStore).put(item);
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve();
            })
          );
        }
      });

      await Promise.all(promises);
    });
  }
}

// Verse Annotation Service
export class VerseAnnotationService {
  private generateId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAnnotationsForSurah(surahNumber: number) {
    const [bookmarks, notes, highlights] = await Promise.all([
      this.getBookmarksForSurah(surahNumber),
      this.getNotesForSurah(surahNumber),
      this.getHighlightsForSurah(surahNumber),
    ]);

    return { bookmarks, notes, highlights };
  }

  async getBookmarksForSurah(surahNumber: number): Promise<VerseBookmark[]> {
    return collectionDB.transaction(VERSE_BOOKMARKS_STORE, 'readonly', async (store) => {
      return new Promise<VerseBookmark[]>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('surahNumber');
        const request = index.getAll(IDBKeyRange.only(surahNumber));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async addBookmark(verseKey: string, surahNumber: number, ayahNumber: number): Promise<VerseBookmark> {
    const bookmark: VerseBookmark = {
      id: this.generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      createdAt: Date.now(),
    };

    await collectionDB.transaction(VERSE_BOOKMARKS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(bookmark);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    return bookmark;
  }

  async removeBookmark(verseKey: string): Promise<void> {
    await collectionDB.transaction(VERSE_BOOKMARKS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('verseKey');
        const request = index.openCursor(IDBKeyRange.only(verseKey));

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            resolve();
          } else {
            resolve();
          }
        };
      });
    });
  }

  async getNotesForSurah(surahNumber: number): Promise<VerseNote[]> {
    return collectionDB.transaction(VERSE_NOTES_STORE, 'readonly', async (store) => {
      return new Promise<VerseNote[]>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('surahNumber');
        const request = index.getAll(IDBKeyRange.only(surahNumber));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async addNote(verseKey: string, surahNumber: number, ayahNumber: number, content: string): Promise<VerseNote> {
    const note: VerseNote = {
      id: this.generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await collectionDB.transaction(VERSE_NOTES_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(note);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    return note;
  }

  async updateNote(noteId: string, content: string): Promise<void> {
    await collectionDB.transaction(VERSE_NOTES_STORE, 'readwrite', async (store) => {
      const note = await new Promise<VerseNote>((resolve, reject) => {
        const request = (store as IDBObjectStore).get(noteId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (note) {
        note.content = content;
        note.updatedAt = Date.now();

        await new Promise<void>((resolve, reject) => {
          const request = (store as IDBObjectStore).put(note);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      }
    });
  }

  async removeNote(noteId: string): Promise<void> {
    await collectionDB.transaction(VERSE_NOTES_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).delete(noteId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });
  }

  async getHighlightsForSurah(surahNumber: number): Promise<VerseHighlight[]> {
    return collectionDB.transaction(VERSE_HIGHLIGHTS_STORE, 'readonly', async (store) => {
      return new Promise<VerseHighlight[]>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('surahNumber');
        const request = index.getAll(IDBKeyRange.only(surahNumber));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async addHighlight(
    verseKey: string,
    surahNumber: number,
    ayahNumber: number,
    color: HighlightColor
  ): Promise<VerseHighlight> {
    const highlight: VerseHighlight = {
      id: this.generateId(),
      verseKey,
      surahNumber,
      ayahNumber,
      color,
      createdAt: Date.now(),
    };

    await collectionDB.transaction(VERSE_HIGHLIGHTS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(highlight);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    return highlight;
  }

  async removeHighlight(verseKey: string): Promise<void> {
    await collectionDB.transaction(VERSE_HIGHLIGHTS_STORE, 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('verseKey');
        const request = index.openCursor(IDBKeyRange.only(verseKey));

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            resolve();
          } else {
            resolve();
          }
        };
      });
    });
  }
}

// Export service instances
export const playlistService = new PlaylistService();
export const verseAnnotationService = new VerseAnnotationService();

// Initialize database
export const initializeCollectionDB = () => collectionDB.init();