import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('recipes page loads correctly', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page).toHaveURL(/\/recipes/);
  });

  test('clicking TabBar item switches page', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await page.waitForSelector('[data-tab="raidboss"]', { timeout: 10000 });
    await page.locator('[data-tab="raidboss"]').click();
    await expect(page).toHaveURL(/\/raidboss/);
  });

  test('logo navigates to home', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await page.waitForSelector('[data-tab="recipes"]', { timeout: 10000 });
    await page.locator('a[href*="l2team-navigator"]').click();
    await expect(page).toHaveURL(/\/l2team-navigator\/?$/);
  });
});
