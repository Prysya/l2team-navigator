import { expect, test } from '@playwright/test';

const PRECACHE_PREFIX = 'workbox-precache';

function isPrecached(url: string, suffix: string): boolean {
  return url.split('?')[0].endsWith(suffix);
}

async function waitForSWReady(page: import('@playwright/test').Page) {
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg?.active != null;
  });
}

async function waitForPrecacheReady(page: import('@playwright/test').Page) {
  await page.waitForFunction(async (prefix) => {
    const keys = await caches.keys();
    const key = keys.find((k) => k.includes(prefix));
    if (!key) return false;
    const cache = await caches.open(key);
    const urls = (await cache.keys()).map((r) => r.url);
    return urls.some((u) => u.split('?')[0].endsWith('/index.html'));
  }, PRECACHE_PREFIX);
}

test.describe('PWA (prod build)', () => {
  test('регистрирует service worker и создаёт прекэш оболочки', async ({ page }) => {
    await page.goto('/');
    await waitForSWReady(page);
    await waitForPrecacheReady(page);

    const state = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const keys = await caches.keys();
      const key = keys.find((k) => k.includes('workbox-precache'));
      const cache = key ? await caches.open(key) : null;
      const urls = (await cache?.keys().then((reqs) => reqs.map((r) => r.url))) ?? [];
      return { scope: reg?.scope, precacheUrls: urls };
    });

    expect(state.scope).toContain('/l2team-navigator/');
    expect(state.precacheUrls.some((u) => isPrecached(u, '/index.html'))).toBe(true);
    expect(state.precacheUrls.some((u) => isPrecached(u, '/sw.js'))).toBe(false);
  });

  test('отдаёт корректный manifest', async ({ request }) => {
    const res = await request.get('manifest.webmanifest');
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.start_url).toBe('/l2team-navigator/');
    expect(manifest.scope).toBe('/l2team-navigator/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#05070d');
    expect(manifest.theme_color).toBe('#05070d');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  test('иконки PWA доступны', async ({ request }) => {
    for (const icon of [
      'images/pwa-192x192.png',
      'images/pwa-512x512.png',
      'images/maskable-icon-512x512.png',
      'images/apple-touch-icon-180x180.png',
    ]) {
      const res = await request.get(icon);
      expect(res.status(), icon).toBe(200);
    }
  });

  test('страница загружается оффлайн из прекэша', async ({ page, context }) => {
    await page.goto('/');
    await waitForSWReady(page);
    await waitForPrecacheReady(page);

    // reload, чтобы service worker стал контроллером страницы
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller != null);

    // эмулируем обрыв сети
    await context.setOffline(true);
    await page.reload();

    await expect(page.getByText('Выберите раздел')).toBeVisible();
  });
});
