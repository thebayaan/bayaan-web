import { describe, it, expect } from "vitest";

describe("middleware", () => {
  it("allows / to serve the home page without redirecting", async () => {
    const { middleware } = await import("@/../middleware");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost:3000/");
    const response = middleware(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
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
