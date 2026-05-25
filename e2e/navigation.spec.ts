import { expect, test } from "@playwright/test";

/**
 * Cross-page navigation: clicking nav primitives lands you on the right
 * route and the destination mounts.
 */

test("sidebar links to quran index", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /Quran/i }).first();
  await link.click();
  await expect(page).toHaveURL(/\/quran(\/.*)?$/);
  await expect(page.getByText(/Read the Quran/i).first()).toBeVisible({ timeout: 15_000 });
});

test("sidebar links to adhkar", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /Adhkar/i }).first();
  await link.click();
  await expect(page).toHaveURL(/\/adhkar(\/.*)?$/);
  await expect(page.getByText(/Adhkar/i).first()).toBeVisible({ timeout: 15_000 });
});

test("404 page renders without error", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(404);
  await expect(page.locator("body")).not.toBeEmpty();
});
