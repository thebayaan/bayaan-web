import { test, expect } from "@playwright/test";

test("root renders without 5xx", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
  await expect(page.locator("body")).not.toBeEmpty();
});

test("quran index loads", async ({ page }) => {
  const response = await page.goto("/quran");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
});
