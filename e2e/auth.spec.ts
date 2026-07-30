import { expect, test } from '@playwright/test';

test.describe('Auth Gate', () => {
  test('shows auth gate on page load without token', async ({ page }) => {
    await page.goto('/l2team-navigator/');

    await expect(page.getByText('L2team Navigator')).toBeVisible();
    await expect(page.getByText('Доступ к сайту')).toBeVisible();
    await expect(page.getByPlaceholder('Введите токен')).toBeVisible();
    await expect(page.getByRole('button', { name: /Войти/ })).toBeVisible();
  });

  test('shows error on invalid token', async ({ page }) => {
    // Mock validate to return failure
    await page.route('**/api/auth/validate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false }),
      });
    });

    await page.goto('/l2team-navigator/');
    await page.getByPlaceholder('Введите токен').fill('invalid-token');
    await page.getByRole('button', { name: /Войти/ }).click();

    await expect(page.getByText('Неверный или истёкший токен')).toBeVisible({ timeout: 10000 });
  });

  test('enters the app with valid token', async ({ page }) => {
    // Mock validate to return success
    await page.route('**/api/auth/validate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, user_id: 123 }),
      });
    });

    await page.goto('/l2team-navigator/');
    await page.getByPlaceholder('Введите токен').fill('valid-token');
    await page.getByRole('button', { name: /Войти/ }).click();

    // After successful auth, should see main page content
    await expect(page.getByText('Выберите раздел')).toBeVisible({ timeout: 10000 });
  });
});
