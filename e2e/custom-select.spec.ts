import { expect, test } from '@playwright/test';

import { setupAuth } from './helpers';

test.describe('Skills Tab', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('loads and shows page content', async ({ page }) => {
    await page.goto('/l2team-navigator/skills');
    await expect(page.locator('[data-tab="skills"]')).toBeVisible({ timeout: 20000 });
  });
});
