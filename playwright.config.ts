import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // next.config.ts uses output: "standalone" (required by Railway),
  // which means `next start` is a no-op. The standalone bundle must be
  // run from .next/standalone/ for its internal path resolution to
  // work. CI pre-builds and stages assets in earlier steps; locally
  // we do the full build+stage first so `npm run test:e2e` still works.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: process.env.CI
          ? "cd .next/standalone && node server.js"
          : "npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && cd .next/standalone && node server.js",
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
        stderr: "pipe",
      },
});
