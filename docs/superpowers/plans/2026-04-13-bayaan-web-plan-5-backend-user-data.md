# Bayaan Web — Plan 5: Backend User Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user accounts, bookmarks, highlights, notes, playlists, favorites, listening history, and reading progress tables to the existing Bayaan backend, with authenticated CRUD endpoints.

**Architecture:** Extends the existing Hono + Bun + Drizzle ORM backend at `~/theBayaan/bayaan-backend`. New `users` table synced from Clerk via webhooks. All user endpoints require a valid Clerk JWT verified via a new `userAuth` middleware. New service files follow the existing pattern (drizzle queries → public DTO). New route files follow the existing Hono pattern (zValidator + service call).

**Tech Stack:** Hono, Drizzle ORM, PostgreSQL, Clerk JWT verification (`@clerk/backend`), Zod v4

**Testing:** Each service function should be testable independently. API routes tested via Hono's built-in test client.

**Spec:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md` (Section 5)

**IMPORTANT:** This plan modifies the BACKEND at `~/theBayaan/bayaan-backend`, NOT the web frontend.

---

## File Structure (Plan 5)

All paths relative to `~/theBayaan/bayaan-backend/`:

```
src/
├── db/
│   └── schema.ts                      # ADD: users, bookmarks, highlights, notes, playlists, playlist_items, favorites, favorite_reciters, listening_history, reading_progress tables
├── middleware/
│   └── userAuth.ts                    # NEW: Clerk JWT verification middleware
├── types/
│   └── api.ts                         # ADD: Zod schemas for user endpoints
├── services/
│   ├── userService.ts                 # NEW: User CRUD (sync from Clerk)
│   ├── bookmarkService.ts            # NEW: Bookmark CRUD
│   ├── highlightService.ts           # NEW: Highlight CRUD
│   ├── noteService.ts                # NEW: Note CRUD
│   ├── playlistService.ts            # NEW: Playlist + items CRUD
│   ├── favoriteService.ts            # NEW: Favorite tracks + reciters CRUD
│   ├── historyService.ts             # NEW: Listening history
│   └── readingProgressService.ts     # NEW: Reading progress
├── routes/
│   ├── v1/
│   │   └── user.ts                    # NEW: All /v1/user/* routes
│   └── webhooks/
│       └── clerk.ts                   # NEW: Clerk webhook handler
└── app.ts                             # MODIFY: Mount new routes
```

---

### Task 1: Database Schema — New User Tables

**Files:**
- Modify: `~/theBayaan/bayaan-backend/src/db/schema.ts`

- [ ] **Step 1: Add all new tables to schema.ts**

Add these table definitions to the end of `~/theBayaan/bayaan-backend/src/db/schema.ts` (after the existing `request_logs` table and before any `relations` calls):

```typescript
// ── Users (synced from Clerk) ────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerk_id: text('clerk_id').notNull().unique(),
    email: text('email').notNull(),
    name: text('name'),
    avatar_url: text('avatar_url'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_clerk_id_idx').on(t.clerk_id)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ── Bookmarks ────────────────────────────────────────────────────────────────

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    verse_key: text('verse_key').notNull(),
    surah_number: integer('surah_number').notNull(),
    ayah_number: integer('ayah_number').notNull(),
    note: text('note'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('bookmarks_user_id_idx').on(t.user_id),
    uniqueIndex('bookmarks_user_verse_idx').on(t.user_id, t.verse_key),
  ],
);

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

// ── Highlights ───────────────────────────────────────────────────────────────

export const highlights = pgTable(
  'highlights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    verse_key: text('verse_key').notNull(),
    color: text('color').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('highlights_user_id_idx').on(t.user_id),
    uniqueIndex('highlights_user_verse_idx').on(t.user_id, t.verse_key),
  ],
);

export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;

// ── Notes ────────────────────────────────────────────────────────────────────

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    verse_key: text('verse_key').notNull(),
    content: text('content').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notes_user_id_idx').on(t.user_id),
    uniqueIndex('notes_user_verse_idx').on(t.user_id, t.verse_key),
  ],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// ── Playlists ────────────────────────────────────────────────────────────────

export const playlists = pgTable(
  'playlists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    is_public: boolean('is_public').notNull().default(false),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('playlists_user_id_idx').on(t.user_id)],
);

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;

// ── Playlist Items ───────────────────────────────────────────────────────────

export const playlist_items = pgTable(
  'playlist_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playlist_id: uuid('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
    reciter_id: uuid('reciter_id').notNull(),
    rewayat_id: uuid('rewayat_id').notNull(),
    surah_id: integer('surah_id').notNull(),
    position: integer('position').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('playlist_items_playlist_id_idx').on(t.playlist_id),
    index('playlist_items_position_idx').on(t.playlist_id, t.position),
  ],
);

export type PlaylistItem = typeof playlist_items.$inferSelect;
export type NewPlaylistItem = typeof playlist_items.$inferInsert;

// ── Favorites (tracks) ──────────────────────────────────────────────────────

export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reciter_id: uuid('reciter_id').notNull(),
    rewayat_id: uuid('rewayat_id').notNull(),
    surah_id: integer('surah_id').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('favorites_user_id_idx').on(t.user_id),
    uniqueIndex('favorites_user_track_idx').on(t.user_id, t.reciter_id, t.rewayat_id, t.surah_id),
  ],
);

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

// ── Favorite Reciters ────────────────────────────────────────────────────────

export const favorite_reciters = pgTable(
  'favorite_reciters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reciter_id: uuid('reciter_id').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('favorite_reciters_user_id_idx').on(t.user_id),
    uniqueIndex('favorite_reciters_user_reciter_idx').on(t.user_id, t.reciter_id),
  ],
);

export type FavoriteReciter = typeof favorite_reciters.$inferSelect;
export type NewFavoriteReciter = typeof favorite_reciters.$inferInsert;

// ── Listening History ────────────────────────────────────────────────────────

export const listening_history = pgTable(
  'listening_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reciter_id: uuid('reciter_id').notNull(),
    rewayat_id: uuid('rewayat_id').notNull(),
    surah_id: integer('surah_id').notNull(),
    last_position_ms: integer('last_position_ms').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    listened_at: timestamp('listened_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('listening_history_user_id_idx').on(t.user_id),
    index('listening_history_listened_at_idx').on(t.user_id, t.listened_at),
  ],
);

export type ListeningHistory = typeof listening_history.$inferSelect;
export type NewListeningHistory = typeof listening_history.$inferInsert;

// ── Reading Progress ─────────────────────────────────────────────────────────

export const reading_progress = pgTable(
  'reading_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
    verse_key: text('verse_key').notNull(),
    page_number: integer('page_number').notNull(),
    scroll_position: real('scroll_position'),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('reading_progress_user_id_idx').on(t.user_id)],
);

export type ReadingProgress = typeof reading_progress.$inferSelect;
export type NewReadingProgress = typeof reading_progress.$inferInsert;
```

You will also need to add the `integer` and `real` imports from drizzle-orm if not already imported. Check the existing imports at the top of `schema.ts` and add:

```typescript
import { pgTable, uuid, text, timestamp, boolean, integer, real, uniqueIndex, index } from 'drizzle-orm/pg-core';
```

- [ ] **Step 2: Generate and run migration**

```bash
cd ~/theBayaan/bayaan-backend
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

Or if using the project's npm scripts:
```bash
bun run db:generate
bun run db:migrate
```

Verify: The migration file should create 10 new tables.

- [ ] **Step 3: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add user data tables — users, bookmarks, highlights, notes, playlists, favorites, history, reading progress"
```

---

### Task 2: User Auth Middleware (Clerk JWT)

**Files:**
- Create: `~/theBayaan/bayaan-backend/src/middleware/userAuth.ts`

- [ ] **Step 1: Install Clerk backend SDK**

```bash
cd ~/theBayaan/bayaan-backend
bun add @clerk/backend
```

- [ ] **Step 2: Create userAuth middleware**

Create `~/theBayaan/bayaan-backend/src/middleware/userAuth.ts`:

```typescript
import type { Context, Next } from 'hono';
import type { MiddlewareHandler } from 'hono/types';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export type UserAuthVar = {
  userId: string;
  clerkUserId: string;
};

export const userAuth: MiddlewareHandler<{ Variables: UserAuthVar }> = async (
  c: Context<{ Variables: UserAuthVar }>,
  next: Next,
) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } }, 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Empty token' } }, 401);
  }

  try {
    const payload = await clerk.verifyToken(token);
    const clerkUserId = payload.sub;

    // Look up internal user ID from clerk_id
    const { getUserByClerkId } = await import('../services/userService');
    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return c.json({ error: { code: 'USER_NOT_FOUND', message: 'User not synced. Please try again.' } }, 404);
    }

    c.set('userId', user.id);
    c.set('clerkUserId', clerkUserId);
    await next();
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
  }
};
```

- [ ] **Step 3: Add CLERK_SECRET_KEY to .env**

Add to `~/theBayaan/bayaan-backend/.env`:
```
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY_HERE
```

And to `.env.example`:
```
CLERK_SECRET_KEY=
```

- [ ] **Step 4: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add Clerk JWT user auth middleware"
```

---

### Task 3: User Service + Clerk Webhook

**Files:**
- Create: `~/theBayaan/bayaan-backend/src/services/userService.ts`
- Create: `~/theBayaan/bayaan-backend/src/routes/webhooks/clerk.ts`

- [ ] **Step 1: Create user service**

Create `~/theBayaan/bayaan-backend/src/services/userService.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.clerk_id, clerkId)).limit(1);
  return user ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function upsertUser(data: {
  clerk_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}): Promise<User> {
  const existing = await getUserByClerkId(data.clerk_id);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        email: data.email,
        name: data.name ?? existing.name,
        avatar_url: data.avatar_url ?? existing.avatar_url,
        updated_at: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerk_id: data.clerk_id,
      email: data.email,
      name: data.name,
      avatar_url: data.avatar_url,
    })
    .returning();
  return created!;
}

export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await db.delete(users).where(eq(users.clerk_id, clerkId));
}
```

- [ ] **Step 2: Create Clerk webhook route**

Create `~/theBayaan/bayaan-backend/src/routes/webhooks/clerk.ts`:

```typescript
import { Hono } from 'hono';
import { upsertUser, deleteUserByClerkId } from '../../services/userService';

const app = new Hono();

// Clerk sends webhooks when users are created/updated/deleted
app.post('/clerk', async (c) => {
  const body = await c.req.json();
  const eventType = body.type as string;
  const data = body.data;

  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const email = data.email_addresses?.[0]?.email_address;
      if (!email) {
        return c.json({ error: 'No email found' }, 400);
      }
      await upsertUser({
        clerk_id: data.id,
        email,
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined,
        avatar_url: data.image_url || undefined,
      });
      break;
    }
    case 'user.deleted': {
      if (data.id) {
        await deleteUserByClerkId(data.id);
      }
      break;
    }
  }

  return c.json({ received: true });
});

export default app;
```

- [ ] **Step 3: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add user service and Clerk webhook handler"
```

---

### Task 4: Zod Schemas for User Endpoints

**Files:**
- Modify: `~/theBayaan/bayaan-backend/src/types/api.ts`

- [ ] **Step 1: Add user endpoint schemas**

Add to the end of `~/theBayaan/bayaan-backend/src/types/api.ts`:

```typescript
// ── User Bookmarks ───────────────────────────────────────────────────────────

export const CreateBookmarkSchema = z.object({
  verse_key: z.string().regex(/^\d+:\d+$/),
  surah_number: z.number().int().min(1).max(114),
  ayah_number: z.number().int().min(1),
  note: z.string().optional(),
});

// ── User Highlights ──────────────────────────────────────────────────────────

export const CreateHighlightSchema = z.object({
  verse_key: z.string().regex(/^\d+:\d+$/),
  color: z.enum(['yellow', 'green', 'blue', 'pink', 'purple']),
});

// ── User Notes ───────────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  verse_key: z.string().regex(/^\d+:\d+$/),
  content: z.string().min(1),
});

export const UpdateNoteSchema = z.object({
  content: z.string().min(1),
});

// ── Playlists ────────────────────────────────────────────────────────────────

export const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const UpdatePlaylistSchema = CreatePlaylistSchema.partial();

export const AddPlaylistItemSchema = z.object({
  reciter_id: z.string().uuid(),
  rewayat_id: z.string().uuid(),
  surah_id: z.number().int().min(1).max(114),
});

// ── Favorites ────────────────────────────────────────────────────────────────

export const CreateFavoriteSchema = z.object({
  reciter_id: z.string().uuid(),
  rewayat_id: z.string().uuid(),
  surah_id: z.number().int().min(1).max(114),
});

export const CreateFavoriteReciterSchema = z.object({
  reciter_id: z.string().uuid(),
});

// ── Listening History ────────────────────────────────────────────────────────

export const CreateHistorySchema = z.object({
  reciter_id: z.string().uuid(),
  rewayat_id: z.string().uuid(),
  surah_id: z.number().int().min(1).max(114),
  last_position_ms: z.number().int().min(0),
  completed: z.boolean().default(false),
});

// ── Reading Progress ─────────────────────────────────────────────────────────

export const UpdateReadingProgressSchema = z.object({
  verse_key: z.string().regex(/^\d+:\d+$/),
  page_number: z.number().int().min(1).max(604),
  scroll_position: z.number().optional(),
});
```

- [ ] **Step 2: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add Zod validation schemas for user data endpoints"
```

---

### Task 5: Service Layer — Bookmarks, Highlights, Notes, Favorites

**Files:**
- Create: `~/theBayaan/bayaan-backend/src/services/bookmarkService.ts`
- Create: `~/theBayaan/bayaan-backend/src/services/highlightService.ts`
- Create: `~/theBayaan/bayaan-backend/src/services/noteService.ts`
- Create: `~/theBayaan/bayaan-backend/src/services/favoriteService.ts`

- [ ] **Step 1: Create bookmark service**

Create `~/theBayaan/bayaan-backend/src/services/bookmarkService.ts`:

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { bookmarks, type Bookmark } from '../db/schema';

export async function listBookmarks(userId: string): Promise<Bookmark[]> {
  return db.select().from(bookmarks).where(eq(bookmarks.user_id, userId)).orderBy(desc(bookmarks.created_at));
}

export async function createBookmark(userId: string, data: { verse_key: string; surah_number: number; ayah_number: number; note?: string }): Promise<Bookmark> {
  const [bookmark] = await db.insert(bookmarks).values({ user_id: userId, ...data }).onConflictDoUpdate({
    target: [bookmarks.user_id, bookmarks.verse_key],
    set: { note: data.note },
  }).returning();
  return bookmark!;
}

export async function deleteBookmark(userId: string, verseKey: string): Promise<void> {
  await db.delete(bookmarks).where(and(eq(bookmarks.user_id, userId), eq(bookmarks.verse_key, verseKey)));
}
```

- [ ] **Step 2: Create highlight service**

Create `~/theBayaan/bayaan-backend/src/services/highlightService.ts`:

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { highlights, type Highlight } from '../db/schema';

export async function listHighlights(userId: string): Promise<Highlight[]> {
  return db.select().from(highlights).where(eq(highlights.user_id, userId)).orderBy(desc(highlights.created_at));
}

export async function createHighlight(userId: string, data: { verse_key: string; color: string }): Promise<Highlight> {
  const [highlight] = await db.insert(highlights).values({ user_id: userId, ...data }).onConflictDoUpdate({
    target: [highlights.user_id, highlights.verse_key],
    set: { color: data.color },
  }).returning();
  return highlight!;
}

export async function deleteHighlight(userId: string, verseKey: string): Promise<void> {
  await db.delete(highlights).where(and(eq(highlights.user_id, userId), eq(highlights.verse_key, verseKey)));
}
```

- [ ] **Step 3: Create note service**

Create `~/theBayaan/bayaan-backend/src/services/noteService.ts`:

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { notes, type Note } from '../db/schema';

export async function listNotes(userId: string): Promise<Note[]> {
  return db.select().from(notes).where(eq(notes.user_id, userId)).orderBy(desc(notes.created_at));
}

export async function createNote(userId: string, data: { verse_key: string; content: string }): Promise<Note> {
  const [note] = await db.insert(notes).values({ user_id: userId, ...data }).onConflictDoUpdate({
    target: [notes.user_id, notes.verse_key],
    set: { content: data.content, updated_at: new Date() },
  }).returning();
  return note!;
}

export async function updateNote(userId: string, verseKey: string, content: string): Promise<Note | null> {
  const [note] = await db.update(notes).set({ content, updated_at: new Date() }).where(and(eq(notes.user_id, userId), eq(notes.verse_key, verseKey))).returning();
  return note ?? null;
}

export async function deleteNote(userId: string, verseKey: string): Promise<void> {
  await db.delete(notes).where(and(eq(notes.user_id, userId), eq(notes.verse_key, verseKey)));
}
```

- [ ] **Step 4: Create favorite service**

Create `~/theBayaan/bayaan-backend/src/services/favoriteService.ts`:

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { favorites, favorite_reciters, type Favorite, type FavoriteReciter } from '../db/schema';

export async function listFavorites(userId: string): Promise<Favorite[]> {
  return db.select().from(favorites).where(eq(favorites.user_id, userId)).orderBy(desc(favorites.created_at));
}

export async function createFavorite(userId: string, data: { reciter_id: string; rewayat_id: string; surah_id: number }): Promise<Favorite> {
  const [fav] = await db.insert(favorites).values({ user_id: userId, ...data }).onConflictDoNothing().returning();
  if (!fav) {
    const [existing] = await db.select().from(favorites).where(
      and(eq(favorites.user_id, userId), eq(favorites.reciter_id, data.reciter_id), eq(favorites.rewayat_id, data.rewayat_id), eq(favorites.surah_id, data.surah_id))
    );
    return existing!;
  }
  return fav;
}

export async function deleteFavorite(userId: string, reciterId: string, rewayatId: string, surahId: number): Promise<void> {
  await db.delete(favorites).where(
    and(eq(favorites.user_id, userId), eq(favorites.reciter_id, reciterId), eq(favorites.rewayat_id, rewayatId), eq(favorites.surah_id, surahId))
  );
}

export async function listFavoriteReciters(userId: string): Promise<FavoriteReciter[]> {
  return db.select().from(favorite_reciters).where(eq(favorite_reciters.user_id, userId)).orderBy(desc(favorite_reciters.created_at));
}

export async function createFavoriteReciter(userId: string, reciterId: string): Promise<FavoriteReciter> {
  const [fav] = await db.insert(favorite_reciters).values({ user_id: userId, reciter_id: reciterId }).onConflictDoNothing().returning();
  if (!fav) {
    const [existing] = await db.select().from(favorite_reciters).where(
      and(eq(favorite_reciters.user_id, userId), eq(favorite_reciters.reciter_id, reciterId))
    );
    return existing!;
  }
  return fav;
}

export async function deleteFavoriteReciter(userId: string, reciterId: string): Promise<void> {
  await db.delete(favorite_reciters).where(and(eq(favorite_reciters.user_id, userId), eq(favorite_reciters.reciter_id, reciterId)));
}
```

- [ ] **Step 5: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add bookmark, highlight, note, and favorite services"
```

---

### Task 6: Service Layer — Playlists, History, Reading Progress

**Files:**
- Create: `~/theBayaan/bayaan-backend/src/services/playlistService.ts`
- Create: `~/theBayaan/bayaan-backend/src/services/historyService.ts`
- Create: `~/theBayaan/bayaan-backend/src/services/readingProgressService.ts`

- [ ] **Step 1: Create playlist service**

Create `~/theBayaan/bayaan-backend/src/services/playlistService.ts`:

```typescript
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { db } from '../db';
import { playlists, playlist_items, type Playlist, type PlaylistItem } from '../db/schema';

export async function listPlaylists(userId: string): Promise<Playlist[]> {
  return db.select().from(playlists).where(eq(playlists.user_id, userId)).orderBy(desc(playlists.created_at));
}

export async function getPlaylist(userId: string, playlistId: string): Promise<{ playlist: Playlist; items: PlaylistItem[] } | null> {
  const [playlist] = await db.select().from(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.user_id, userId)));
  if (!playlist) return null;
  const items = await db.select().from(playlist_items).where(eq(playlist_items.playlist_id, playlistId)).orderBy(asc(playlist_items.position));
  return { playlist, items };
}

export async function createPlaylist(userId: string, data: { name: string; description?: string }): Promise<Playlist> {
  const [playlist] = await db.insert(playlists).values({ user_id: userId, ...data }).returning();
  return playlist!;
}

export async function updatePlaylist(userId: string, playlistId: string, data: { name?: string; description?: string }): Promise<Playlist | null> {
  const [updated] = await db.update(playlists).set({ ...data, updated_at: new Date() }).where(and(eq(playlists.id, playlistId), eq(playlists.user_id, userId))).returning();
  return updated ?? null;
}

export async function deletePlaylist(userId: string, playlistId: string): Promise<void> {
  await db.delete(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.user_id, userId)));
}

export async function addPlaylistItem(playlistId: string, data: { reciter_id: string; rewayat_id: string; surah_id: number }): Promise<PlaylistItem> {
  const [maxPos] = await db.select({ value: count() }).from(playlist_items).where(eq(playlist_items.playlist_id, playlistId));
  const position = (maxPos?.value ?? 0);
  const [item] = await db.insert(playlist_items).values({ playlist_id: playlistId, position, ...data }).returning();
  return item!;
}

export async function removePlaylistItem(playlistId: string, itemId: string): Promise<void> {
  await db.delete(playlist_items).where(and(eq(playlist_items.id, itemId), eq(playlist_items.playlist_id, playlistId)));
}
```

- [ ] **Step 2: Create history service**

Create `~/theBayaan/bayaan-backend/src/services/historyService.ts`:

```typescript
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { listening_history, type ListeningHistory } from '../db/schema';

export async function listHistory(userId: string, limit: number = 50): Promise<ListeningHistory[]> {
  return db.select().from(listening_history).where(eq(listening_history.user_id, userId)).orderBy(desc(listening_history.listened_at)).limit(limit);
}

export async function addHistory(userId: string, data: { reciter_id: string; rewayat_id: string; surah_id: number; last_position_ms: number; completed: boolean }): Promise<ListeningHistory> {
  const [entry] = await db.insert(listening_history).values({ user_id: userId, ...data }).returning();
  return entry!;
}
```

- [ ] **Step 3: Create reading progress service**

Create `~/theBayaan/bayaan-backend/src/services/readingProgressService.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { reading_progress, type ReadingProgress } from '../db/schema';

export async function getReadingProgress(userId: string): Promise<ReadingProgress | null> {
  const [progress] = await db.select().from(reading_progress).where(eq(reading_progress.user_id, userId));
  return progress ?? null;
}

export async function upsertReadingProgress(userId: string, data: { verse_key: string; page_number: number; scroll_position?: number }): Promise<ReadingProgress> {
  const existing = await getReadingProgress(userId);
  if (existing) {
    const [updated] = await db.update(reading_progress).set({ ...data, updated_at: new Date() }).where(eq(reading_progress.user_id, userId)).returning();
    return updated!;
  }
  const [created] = await db.insert(reading_progress).values({ user_id: userId, ...data }).returning();
  return created!;
}
```

- [ ] **Step 4: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add playlist, history, and reading progress services"
```

---

### Task 7: User Routes + Mount in App

**Files:**
- Create: `~/theBayaan/bayaan-backend/src/routes/v1/user.ts`
- Modify: `~/theBayaan/bayaan-backend/src/app.ts`

- [ ] **Step 1: Create user routes**

Create `~/theBayaan/bayaan-backend/src/routes/v1/user.ts`:

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { userAuth, type UserAuthVar } from '../../middleware/userAuth';
import { success } from '../../lib/response';
import {
  CreateBookmarkSchema, CreateHighlightSchema, CreateNoteSchema, UpdateNoteSchema,
  CreatePlaylistSchema, UpdatePlaylistSchema, AddPlaylistItemSchema,
  CreateFavoriteSchema, CreateFavoriteReciterSchema,
  CreateHistorySchema, UpdateReadingProgressSchema,
} from '../../types/api';
import * as bookmarkService from '../../services/bookmarkService';
import * as highlightService from '../../services/highlightService';
import * as noteService from '../../services/noteService';
import * as playlistService from '../../services/playlistService';
import * as favoriteService from '../../services/favoriteService';
import * as historyService from '../../services/historyService';
import * as readingProgressService from '../../services/readingProgressService';

const app = new Hono<{ Variables: UserAuthVar }>();
app.use('*', userAuth);

// ── Bookmarks ────────────────────────────────────────────────────────────────

app.get('/bookmarks', async (c) => {
  const userId = c.get('userId');
  const data = await bookmarkService.listBookmarks(userId);
  return success(c, data);
});

app.post('/bookmarks', zValidator('json', CreateBookmarkSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await bookmarkService.createBookmark(userId, body);
  return success(c, data, 201);
});

app.delete('/bookmarks/:verseKey', async (c) => {
  const userId = c.get('userId');
  const verseKey = c.req.param('verseKey');
  await bookmarkService.deleteBookmark(userId, verseKey);
  return success(c, { deleted: true });
});

// ── Highlights ───────────────────────────────────────────────────────────────

app.get('/highlights', async (c) => {
  const userId = c.get('userId');
  const data = await highlightService.listHighlights(userId);
  return success(c, data);
});

app.post('/highlights', zValidator('json', CreateHighlightSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await highlightService.createHighlight(userId, body);
  return success(c, data, 201);
});

app.delete('/highlights/:verseKey', async (c) => {
  const userId = c.get('userId');
  const verseKey = c.req.param('verseKey');
  await highlightService.deleteHighlight(userId, verseKey);
  return success(c, { deleted: true });
});

// ── Notes ────────────────────────────────────────────────────────────────────

app.get('/notes', async (c) => {
  const userId = c.get('userId');
  const data = await noteService.listNotes(userId);
  return success(c, data);
});

app.post('/notes', zValidator('json', CreateNoteSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await noteService.createNote(userId, body);
  return success(c, data, 201);
});

app.put('/notes/:verseKey', zValidator('json', UpdateNoteSchema), async (c) => {
  const userId = c.get('userId');
  const verseKey = c.req.param('verseKey');
  const { content } = c.req.valid('json');
  const data = await noteService.updateNote(userId, verseKey, content);
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Note not found' } }, 404);
  return success(c, data);
});

app.delete('/notes/:verseKey', async (c) => {
  const userId = c.get('userId');
  const verseKey = c.req.param('verseKey');
  await noteService.deleteNote(userId, verseKey);
  return success(c, { deleted: true });
});

// ── Playlists ────────────────────────────────────────────────────────────────

app.get('/playlists', async (c) => {
  const userId = c.get('userId');
  const data = await playlistService.listPlaylists(userId);
  return success(c, data);
});

app.post('/playlists', zValidator('json', CreatePlaylistSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await playlistService.createPlaylist(userId, body);
  return success(c, data, 201);
});

app.get('/playlists/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const data = await playlistService.getPlaylist(userId, id);
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Playlist not found' } }, 404);
  return success(c, data);
});

app.put('/playlists/:id', zValidator('json', UpdatePlaylistSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const data = await playlistService.updatePlaylist(userId, id, body);
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Playlist not found' } }, 404);
  return success(c, data);
});

app.delete('/playlists/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  await playlistService.deletePlaylist(userId, id);
  return success(c, { deleted: true });
});

app.post('/playlists/:id/items', zValidator('json', AddPlaylistItemSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  // Verify playlist ownership
  const playlist = await playlistService.getPlaylist(userId, id);
  if (!playlist) return c.json({ error: { code: 'NOT_FOUND', message: 'Playlist not found' } }, 404);
  const data = await playlistService.addPlaylistItem(id, body);
  return success(c, data, 201);
});

app.delete('/playlists/:id/items/:itemId', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const itemId = c.req.param('itemId');
  const playlist = await playlistService.getPlaylist(userId, id);
  if (!playlist) return c.json({ error: { code: 'NOT_FOUND', message: 'Playlist not found' } }, 404);
  await playlistService.removePlaylistItem(id, itemId);
  return success(c, { deleted: true });
});

// ── Favorites ────────────────────────────────────────────────────────────────

app.get('/favorites', async (c) => {
  const userId = c.get('userId');
  const data = await favoriteService.listFavorites(userId);
  return success(c, data);
});

app.post('/favorites', zValidator('json', CreateFavoriteSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await favoriteService.createFavorite(userId, body);
  return success(c, data, 201);
});

app.delete('/favorites', zValidator('json', CreateFavoriteSchema), async (c) => {
  const userId = c.get('userId');
  const { reciter_id, rewayat_id, surah_id } = c.req.valid('json');
  await favoriteService.deleteFavorite(userId, reciter_id, rewayat_id, surah_id);
  return success(c, { deleted: true });
});

// ── Favorite Reciters ────────────────────────────────────────────────────────

app.get('/favorite-reciters', async (c) => {
  const userId = c.get('userId');
  const data = await favoriteService.listFavoriteReciters(userId);
  return success(c, data);
});

app.post('/favorite-reciters', zValidator('json', CreateFavoriteReciterSchema), async (c) => {
  const userId = c.get('userId');
  const { reciter_id } = c.req.valid('json');
  const data = await favoriteService.createFavoriteReciter(userId, reciter_id);
  return success(c, data, 201);
});

app.delete('/favorite-reciters/:reciterId', async (c) => {
  const userId = c.get('userId');
  const reciterId = c.req.param('reciterId');
  await favoriteService.deleteFavoriteReciter(userId, reciterId);
  return success(c, { deleted: true });
});

// ── History ──────────────────────────────────────────────────────────────────

app.get('/history', async (c) => {
  const userId = c.get('userId');
  const data = await historyService.listHistory(userId);
  return success(c, data);
});

app.post('/history', zValidator('json', CreateHistorySchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await historyService.addHistory(userId, body);
  return success(c, data, 201);
});

// ── Reading Progress ─────────────────────────────────────────────────────────

app.get('/reading-progress', async (c) => {
  const userId = c.get('userId');
  const data = await readingProgressService.getReadingProgress(userId);
  return success(c, data);
});

app.put('/reading-progress', zValidator('json', UpdateReadingProgressSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const data = await readingProgressService.upsertReadingProgress(userId, body);
  return success(c, data);
});

export default app;
```

- [ ] **Step 2: Mount routes in app.ts**

In `~/theBayaan/bayaan-backend/src/app.ts`, add the imports and route mounting:

Add at the top with other imports:
```typescript
import userRoutes from './routes/v1/user';
import clerkWebhookRoutes from './routes/webhooks/clerk';
```

Mount after the existing `app.route('/v1', v1)`:
```typescript
app.route('/v1/user', userRoutes);
app.route('/v1/webhooks', clerkWebhookRoutes);
```

- [ ] **Step 3: Verify the backend starts**

```bash
cd ~/theBayaan/bayaan-backend
bun run src/index.ts
```

Expected: Server starts without errors on the configured port.

- [ ] **Step 4: Commit**

```bash
cd ~/theBayaan/bayaan-backend
git add -A
git commit -m "feat: add user CRUD routes and mount in app"
```

---

## Completion Criteria

After completing all 7 tasks:
1. 10 new tables exist in PostgreSQL (users, bookmarks, highlights, notes, playlists, playlist_items, favorites, favorite_reciters, listening_history, reading_progress)
2. Clerk JWT verification middleware works for all `/v1/user/*` routes
3. Clerk webhook at `/v1/webhooks/clerk` syncs user create/update/delete
4. Full CRUD for bookmarks, highlights, notes (by verse_key)
5. Full CRUD for playlists with items (add/remove)
6. Full CRUD for favorites (tracks and reciters)
7. Listening history (list + add)
8. Reading progress (get + upsert)
9. All Zod validation schemas enforce correct input
10. Backend starts without errors
11. All changes committed on the backend repo
