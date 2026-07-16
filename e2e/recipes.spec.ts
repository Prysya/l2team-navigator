import { test, expect } from '@playwright/test';

test.describe('Recipes Tab', () => {
  test('loads and shows controls after data fetch', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');

    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Все грейды', { exact: true })).toBeVisible();
  });

  test('grade selector is hidden when Material type is selected', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByText('Все типы').click();
    await page.getByText('Ресурсы').click();

    await expect(page.getByText('Все грейды', { exact: true })).not.toBeVisible();
  });

  test('selecting a recipe shows card with tabs', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByText('Все типы').click();
    await page.getByText('Оружие').click();

    const recipeTriggers = page.locator('[class*="trigger"]');
    const recipeTrigger = recipeTriggers.nth(2);
    await recipeTrigger.click();
    const firstOption = page.locator('[class*="option"]').first();
    await firstOption.waitFor({ timeout: 10000 });
    await firstOption.click();

    await expect(page.getByText('Крафт', { exact: true })).toBeVisible();
    await expect(page.getByText('Информация о предмете', { exact: true })).toBeVisible();
  });

  test('craft tab shows component tree', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByText('Все типы').click();
    await page.getByText('Оружие').click();

    const recipeTriggers = page.locator('[class*="trigger"]');
    await recipeTriggers.nth(2).click();
    const firstOption = page.locator('[class*="option"]').first();
    await firstOption.waitFor({ timeout: 10000 });
    await firstOption.click();

    await page.getByText('Крафт', { exact: true }).click();

    await expect(page.getByText('Уровень крафта')).toBeVisible();
    await expect(page.getByText('MP')).toBeVisible();
    await expect(page.getByText('Шанс')).toBeVisible();
  });

  test('info tab shows item details', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByText('Все типы').click();
    await page.getByText('Оружие').click();

    await page.locator('[class*="trigger"]').nth(2).click();
    const firstOption = page.locator('[class*="option"]').first();
    await firstOption.waitFor({ timeout: 10000 });
    await firstOption.click();

    await page.getByText('Информация о предмете', { exact: true }).click();

    await expect(page.getByText('Результат:')).toBeVisible();
    await expect(page.getByText('Вес', { exact: true })).toBeVisible();
    await expect(page.getByText('Цена продажи', { exact: true })).toBeVisible();
  });
});
