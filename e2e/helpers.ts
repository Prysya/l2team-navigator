import type { Page } from '@playwright/test';

export async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('navigator_token', 'e2e-test-token');
  });

  await page.route('**/api/auth/validate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, user_id: 1 }),
    });
  });
}
