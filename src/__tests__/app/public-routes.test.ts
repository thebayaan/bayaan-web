import { describe, it, expect, vi } from "vitest";

describe("middleware public carve-outs", () => {
  it("treats reading surfaces (/quran, /surah, /adhkar, /settings) as public and gates /reciter", async () => {
    const capturedPatterns: string[][] = [];
    vi.resetModules();
    vi.doMock("@clerk/nextjs/server", () => ({
      clerkMiddleware: vi.fn((handler: unknown) => handler),
      createRouteMatcher: (patterns: string[]) => {
        capturedPatterns.push(patterns);
        return () => false;
      },
    }));
    await import("@/../proxy");
    expect(capturedPatterns[0]).toEqual(
      expect.arrayContaining([
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/api/quran(.*)",
        "/quran(.*)",
        "/surah(.*)",
        "/mushaf(.*)",
        "/adhkar(.*)",
        "/settings(.*)",
        "/sitemap.xml",
        "/robots.txt",
        "/\\.well-known(.*)",
      ]),
    );
    expect(capturedPatterns[0]).not.toContain("/reciter(.*)");
    vi.doUnmock("@clerk/nextjs/server");
    vi.resetModules();
  });
});

describe("sitemap", () => {
  it("includes home, /quran, /adhkar, all 114 surahs, and every adhkar category", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const routes = sitemap();
    const urls = routes.map((r) => r.url);
    expect(urls).toContain(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.thebayaan.com"}/`);
    expect(urls.filter((u) => /\/quran\/\d+$/.test(u))).toHaveLength(114);
    expect(urls.filter((u) => /\/adhkar\/[^/]+$/.test(u)).length).toBeGreaterThan(100);
  });
});

describe("robots", () => {
  it("allows public surfaces and disallows private surfaces", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots();
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(rule?.allow).toEqual(expect.arrayContaining(["/quran", "/adhkar"]));
    expect(rule?.disallow).toEqual(
      expect.arrayContaining(["/api/", "/collection", "/settings", "/search", "/reciter"]),
    );
    expect(rules.sitemap).toMatch(/sitemap\.xml$/);
  });
});
