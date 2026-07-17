import { expect, test } from '@playwright/test';

test.describe('Main Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/l2team-navigator/');
    await page.locator('body').click();
  });

  test('shows title and section cards', async ({ page }) => {
    await expect(page.getByText('L2team Database')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Рецепты' }).first()).toBeVisible();
  });

  test('navigates to quests tab on card click', async ({ page }) => {
    const questCard = page.locator('[class*="grid"] button').filter({ hasText: 'Квесты' });
    await questCard.click();
    await expect(page).toHaveURL(/\/quests/);
  });

  test('easter egg opens modal on iddqd', async ({ page }) => {
    await page.keyboard.press('KeyI');
    await page.keyboard.press('KeyD');
    await page.keyboard.press('KeyD');
    await page.keyboard.press('KeyQ');
    await page.keyboard.press('KeyD');
    await expect(page.getByText('Саша Ролекс Пес')).toBeVisible();
  });

  test('closes easter egg on close button', async ({ page }) => {
    await page.keyboard.press('KeyI');
    await page.keyboard.press('KeyD');
    await page.keyboard.press('KeyD');
    await page.keyboard.press('KeyQ');
    await page.keyboard.press('KeyD');
    await expect(page.getByText('Саша Ролекс Пес')).toBeVisible();
    const closeBtn = page.locator('button').filter({ hasText: '✕' }).last();
    await closeBtn.click({ force: true });
    await expect(page.getByText('Саша Ролекс Пес')).not.toBeVisible();
  });
});
