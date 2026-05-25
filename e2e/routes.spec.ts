import { expect, test } from "@playwright/test";

/**
 * Route-level smoke tests. Each test verifies that a public route mounts
 * server-side and that a stable, bundled-data anchor is visible on the
 * client. Tests deliberately avoid routes that require a real Bayaan API
 * (reciter catalogue, audio) because CI runs against a placeholder backend.
 */

const PUBLIC_ROUTES: ReadonlyArray<{ path: string; anchor: RegExp; name: string }> = [
  { path: "/", anchor: /Bayaan/i, name: "home" },
  { path: "/quran", anchor: /Read the Quran/i, name: "quran index" },
  { path: "/quran/1", anchor: /Al-?Fatihah|الفاتحة/i, name: "surah 1" },
  { path: "/quran/1/7", anchor: /Al-?Fatihah|الفاتحة/i, name: "verse deep link" },
  { path: "/adhkar", anchor: /Adhkar/i, name: "adhkar index" },
  { path: "/settings", anchor: /Settings/i, name: "settings root" },
  { path: "/settings/about", anchor: /Alhamdulillah/i, name: "settings about" },
  { path: "/settings/appearance", anchor: /Theme|Appearance/i, name: "settings appearance" },
  { path: "/settings/reading", anchor: /Mushaf|Reading|Translations/i, name: "settings reading" },
  { path: "/settings/credits", anchor: /Credits/i, name: "settings credits" },
  { path: "/search", anchor: /Search/i, name: "search" },
  { path: "/collection", anchor: /Favorites|Bookmarks|Playlists|Collection/i, name: "collection" },
  {
    path: "/collection/bookmarks",
    anchor: /Bookmarks|No bookmarks|Empty/i,
    name: "collection bookmarks",
  },
  {
    path: "/collection/playlists",
    anchor: /Playlists|No playlists|Empty/i,
    name: "collection playlists",
  },
];

for (const route of PUBLIC_ROUTES) {
  test(`route renders: ${route.name} (${route.path})`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response, `no response for ${route.path}`).not.toBeNull();
    expect(response!.status(), `non-2xx status for ${route.path}`).toBeLessThan(400);

    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByText(route.anchor).first()).toBeVisible({ timeout: 15_000 });
  });
}

test("mushaf route mounts", async ({ page }) => {
  // /mushaf only handles /mushaf/[page]; navigate directly to page 1.
  const response = await page.goto("/mushaf/1");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/mushaf\/\d+$/);
  await expect(page.locator("body")).not.toBeEmpty();
});

test("robots.txt is served", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/User-agent:/i);
});

test("sitemap.xml is served", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("<urlset");
});

test("opengraph image is served", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  // Accept either a redirect to the actual image or a direct image response.
  expect([200, 301, 302, 307, 308]).toContain(response.status());
});
