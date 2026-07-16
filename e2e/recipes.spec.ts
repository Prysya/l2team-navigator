import { expect, test } from '@playwright/test';

test.describe('Recipes Tab', () => {
  test('loads and shows controls after data fetch', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');

    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Все грейды', { exact: true })).toBeVisible();
  });

  test('grade selector is hidden when Material type is selected', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByTestId('recipe-type-select').click();
    await page.getByText('Ресурсы').click();

    await expect(page.getByText('Все грейды', { exact: true })).not.toBeVisible();
  });

  test('selecting a recipe shows card with tabs', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByTestId('recipe-type-select').click();
    await page.getByText('Оружие').click();

    await page.getByTestId('recipe-recipe-select').click();
    const firstOption = page.locator('[class*="option"]').first();
    await firstOption.waitFor({ timeout: 10000 });
    await firstOption.click();

    await expect(page.getByText('Крафт', { exact: true })).toBeVisible();
    await expect(page.getByText('Информация о предмете', { exact: true })).toBeVisible();
  });

  test('craft tab shows component tree', async ({ page }) => {
    await page.goto('/l2team-navigator/recipes');
    await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

    await page.getByTestId('recipe-type-select').click();
    await page.getByText('Оружие').click();

    await page.getByTestId('recipe-recipe-select').click();
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

    await page.getByTestId('recipe-type-select').click();
    await page.getByText('Оружие').click();

    await page.getByTestId('recipe-recipe-select').click();
    const firstOption = page.locator('[class*="option"]').first();
    await firstOption.waitFor({ timeout: 10000 });
    await firstOption.click();

    await page.getByText('Информация о предмете', { exact: true }).click();

    await expect(page.getByText('Результат:')).toBeVisible();
    await expect(page.getByText('Вес', { exact: true })).toBeVisible();
    await expect(page.getByText('Цена продажи', { exact: true })).toBeVisible();
  });

  test.describe('Search', () => {
    test('search shows dropdown with results when focused', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Yaksa');

      const dropdown = page.locator('[class*="searchDropdown"]');
      await expect(dropdown).toBeVisible();
      await expect(dropdown.locator('[class*="searchResultName"]').first()).toBeVisible();
    });

    test('search dropdown closes on blur', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Yaksa');

      await expect(page.locator('[class*="searchDropdown"]')).toBeVisible();

      await page.getByText('Все типы').click();
      await expect(page.locator('[class*="searchDropdown"]')).not.toBeVisible();
    });

    test('search results respect selected type filter', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      await page.getByTestId('recipe-type-select').click();
      await page.getByText('Броня').click();

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Yaksa');

      const dropdown = page.locator('[class*="searchDropdown"]');
      await expect(dropdown).toBeVisible();
      await expect(dropdown.locator('[class*="searchResultName"]')).toHaveCount(0);

      await searchInput.fill('Zubei');
      await expect(dropdown.locator('[class*="searchResultName"]').first()).toBeVisible();
    });

    test('clicking search result selects recipe and shows card', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Yaksa');

      const firstResult = page.locator('[class*="searchResultItem"]').first();
      await firstResult.waitFor({ timeout: 10000 });

      const recipeNameEl = firstResult.locator('[class*="searchResultName"]');
      const recipeName = await recipeNameEl.textContent();
      await firstResult.click();
      await page.waitForTimeout(300);

      await expect(page.getByRole('heading', { name: recipeName!.trim() })).toBeVisible();
      await expect(page.getByText('Крафт', { exact: true })).toBeVisible();
    });

    test('search does not filter recipe selector options', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      await page.getByTestId('recipe-type-select').click();
      await page.getByText('Оружие').click();

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Sword');

      await page.getByTestId('recipe-recipe-select').click();
      const options = page.locator('[class*="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThanOrEqual(170);
    });

    test('clear button empties search and hides dropdown', async ({ page }) => {
      await page.goto('/l2team-navigator/recipes');
      await expect(page.getByText('Все типы')).toBeVisible({ timeout: 20000 });

      const searchInput = page.locator('input[name="recipe-search"]');
      await searchInput.click();
      await searchInput.fill('Yaksa');
      await expect(page.locator('[class*="searchDropdown"]')).toBeVisible();

      const clearBtn = page.locator('[aria-label="Очистить поиск"]');
      await clearBtn.click();

      await expect(searchInput).toHaveValue('');
      await expect(page.locator('[class*="searchDropdown"]')).not.toBeVisible();
    });
  });
});
