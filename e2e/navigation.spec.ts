import { expect, test } from '@playwright/test';

import { setupAuth } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('recipes page loads correctly', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page).toHaveURL(/\/recipes/);
  });

  test('clicking TabBar item switches page', async ({ page }) => {
    await page.goto('/recipes');
    await page.waitForSelector('[data-tab="raidboss"]', { timeout: 10000 });
    await page.locator('[data-tab="raidboss"]').click();
    await expect(page).toHaveURL(/\/raidboss/);
  });

  test('logo navigates to home', async ({ page }) => {
    await page.goto('/recipes');
    await page.waitForSelector('[data-tab="recipes"]', { timeout: 10000 });
    await page.locator('.header-logo').click();
    await expect(page).toHaveURL(/\/$/);
  });
});
