import { test, expect } from '@playwright/test';

test.describe('Skills Tab', () => {
  test('loads and shows page content', async ({ page }) => {
    await page.goto('/l2team-navigator/skills');
    await expect(page.locator('[data-tab="skills"]')).toBeVisible({ timeout: 20000 });
  });
});
