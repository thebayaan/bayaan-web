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
  http.get(`${API}/bayaan/user/bookmarks`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/bayaan/user/notes`, () => HttpResponse.json({ data: [] })),
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
