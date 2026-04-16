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
