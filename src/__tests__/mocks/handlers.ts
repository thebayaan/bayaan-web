import { http, HttpResponse } from "msw";
import { mockReciters } from "./fixtures";

const API = "http://localhost:3000/api";

export const handlers = [
  http.get(`${API}/bayaan/reciters`, () =>
    HttpResponse.json({
      data: mockReciters,
      pagination: { page: 1, limit: 200, total: mockReciters.length },
    }),
  ),

  http.get(`${API}/bayaan/reciters/:slug`, ({ params }) => {
    const reciter = mockReciters.find((r) => r.slug === params.slug || r.id === params.slug);
    if (!reciter) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: reciter });
  }),

  http.get(`${API}/bayaan/user/favorites`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/bayaan/user/favorite-reciters`, () => HttpResponse.json({ data: [] })),
  http.post(`${API}/bayaan/user/favorite-reciters`, async ({ request }) => {
    const body = (await request.json()) as { reciter_id: string };
    return HttpResponse.json(
      {
        data: {
          id: `fav-${body.reciter_id}`,
          reciter_id: body.reciter_id,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.delete(`${API}/bayaan/user/favorite-reciters/:reciterId`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),
  http.get(`${API}/bayaan/user/bookmarks`, () => HttpResponse.json({ data: [] })),
  http.post(`${API}/bayaan/user/bookmarks`, async ({ request }) => {
    const body = (await request.json()) as {
      verse_key: string;
      surah_number: number;
      ayah_number: number;
      note?: string;
    };
    return HttpResponse.json(
      {
        data: {
          id: `bookmark-${body.verse_key}`,
          user_id: "mock-user",
          ...body,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.delete(`${API}/bayaan/user/bookmarks/:verseKey`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),

  http.get(`${API}/bayaan/user/highlights`, () => HttpResponse.json({ data: [] })),
  http.post(`${API}/bayaan/user/highlights`, async ({ request }) => {
    const body = (await request.json()) as { verse_key: string; color: string };
    return HttpResponse.json(
      {
        data: {
          id: `h-${body.verse_key}`,
          user_id: "mock-user",
          ...body,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.delete(`${API}/bayaan/user/highlights/:verseKey`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),

  http.get(`${API}/bayaan/user/notes`, () => HttpResponse.json({ data: [] })),
  http.post(`${API}/bayaan/user/notes`, async ({ request }) => {
    const body = (await request.json()) as { verse_key: string; content: string };
    return HttpResponse.json(
      {
        data: {
          id: `n-${body.verse_key}`,
          user_id: "mock-user",
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.put(`${API}/bayaan/user/notes/:verseKey`, async ({ params, request }) => {
    const body = (await request.json()) as { content: string };
    return HttpResponse.json({
      data: {
        id: `n-${params.verseKey}`,
        user_id: "mock-user",
        verse_key: String(params.verseKey),
        content: body.content,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
    });
  }),
  http.delete(`${API}/bayaan/user/notes/:verseKey`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),
  http.get(`${API}/bayaan/user/playlists`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/bayaan/user/playlists/:id`, ({ params }) =>
    HttpResponse.json({
      data: {
        playlist: {
          id: String(params.id),
          name: "Mock playlist",
          description: "",
          is_public: false,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        items: [],
      },
    }),
  ),
  http.post(`${API}/bayaan/user/playlists`, async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };
    return HttpResponse.json(
      {
        data: {
          id: "playlist-created",
          name: body.name,
          description: body.description ?? "",
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.put(`${API}/bayaan/user/playlists/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { name?: string; description?: string };
    return HttpResponse.json({
      data: {
        id: String(params.id),
        name: body.name ?? "Renamed",
        description: body.description ?? "",
        is_public: false,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
    });
  }),
  http.delete(`${API}/bayaan/user/playlists/:id`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),
  http.post(`${API}/bayaan/user/playlists/:id/items`, async ({ params, request }) => {
    const body = (await request.json()) as {
      reciter_id: string;
      rewayat_id: string;
      surah_id: number;
    };
    return HttpResponse.json(
      {
        data: {
          id: `item-created-${params.id}`,
          playlist_id: String(params.id),
          reciter_id: body.reciter_id,
          rewayat_id: body.rewayat_id,
          surah_id: body.surah_id,
          position: 0,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
  http.delete(`${API}/bayaan/user/playlists/:id/items/:itemId`, () =>
    HttpResponse.json({ data: { deleted: true } }),
  ),

  http.get(`${API}/quran/verses/by_chapter/:chapter`, ({ params }) =>
    HttpResponse.json({
      verses: [
        {
          id: 1,
          verse_key: `${params.chapter}:1`,
          page_number: 1,
          text_uthmani: "",
          words: [],
        },
      ],
      pagination: { per_page: 50, current_page: 1, total_pages: 1, total_records: 1 },
    }),
  ),

  http.get(`${API}/quran/verses/by_page/:page`, ({ params }) =>
    HttpResponse.json({
      verses: [
        {
          id: 1,
          verse_key: "1:1",
          page_number: Number(params.page),
          text_uthmani: "",
          words: [],
        },
      ],
      pagination: { per_page: 50, current_page: 1, total_pages: 1, total_records: 1 },
    }),
  ),
];
