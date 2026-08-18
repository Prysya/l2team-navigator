import { describe, expect, it } from 'vitest';

import { pwaConfig } from '../config';

function getRule(cacheName: string) {
  const rule = pwaConfig.workbox?.runtimeCaching?.find((r) => r.options?.cacheName === cacheName);
  if (!rule) throw new Error(`Нет runtime-правила с cacheName "${cacheName}"`);
  return rule;
}

function matches(rule: { urlPattern?: unknown }, url: string): boolean {
  const pattern = rule.urlPattern;
  if (typeof pattern === 'string') return new RegExp(pattern).test(url);
  if (pattern instanceof RegExp) return pattern.test(url);
  return false;
}

describe('pwaConfig', () => {
  it('регистрирует обновления автоматически и не падает при превышении лимита прекэша', () => {
    expect(pwaConfig.registerType).toBe('autoUpdate');
    expect(pwaConfig.showMaximumFileSizeToCacheInBytesWarning).toBe(true);
  });

  it('имеет корректный manifest для GitHub Pages', () => {
    const m = pwaConfig.manifest;
    if (!m) throw new Error('manifest не задан');
    expect(m.name).toBe('L2team Database');
    expect(m.short_name).toBe('L2team');
    expect(m.lang).toBe('ru');
    expect(m.start_url).toBe('/l2team-navigator/');
    expect(m.scope).toBe('/l2team-navigator/');
    expect(m.display).toBe('standalone');
    expect(m.background_color).toBe('#05070d');
    expect(m.theme_color).toBe('#05070d');
  });

  it('включает иконки 192, 512 и maskable', () => {
    const m = pwaConfig.manifest;
    if (!m) throw new Error('manifest не задан');
    const icons = m.icons ?? [];
    expect(icons).toHaveLength(3);
    expect(icons.map((i) => i.src)).toEqual([
      'images/pwa-192x192.png',
      'images/pwa-512x512.png',
      'images/maskable-icon-512x512.png',
    ]);
    expect(icons.find((i) => i.sizes === '512x512' && i.purpose === 'maskable')).toBeDefined();
  });

  it('ограничивает прекэш 2 МБ, чтобы тяжёлые данные (Skills/Recipes) не попадали в него', () => {
    expect(pwaConfig.workbox?.maximumFileSizeToCacheInBytes).toBe(2 * 1024 * 1024);
  });

  it('прекэширует оболочку (HTML, шрифты, иконки, telegram-web-app.js)', () => {
    const patterns = pwaConfig.workbox?.globPatterns;
    expect(patterns).toContain('**/*.{js,css,html,woff,woff2,ttf,ico,svg,webmanifest}');
    expect(patterns).toContain('telegram-web-app.js');
    expect(patterns).toContain('images/pwa-*');
  });

  describe('runtimeCaching', () => {
    it('кэширует ленивые чанки через NetworkFirst', () => {
      const rule = getRule('lazy-chunks');
      expect(rule.handler).toBe('NetworkFirst');
      expect(rule.options?.networkTimeoutSeconds).toBe(10);
      expect(matches(rule, 'https://site.example/l2team-navigator/assets/SkillsTab-abc123.js')).toBe(true);
      expect(matches(rule, 'https://site.example/l2team-navigator/assets/data-xyz.json')).toBe(true);
    });

    it('кэширует картинки боссов и квестов через CacheFirst', () => {
      const rule = getRule('game-images');
      expect(rule.handler).toBe('CacheFirst');
      expect(matches(rule, 'https://site.example/l2team-navigator/images/bosses/queen-ant.png')).toBe(true);
      expect(matches(rule, 'https://site.example/l2team-navigator/images/quests/quest-1.jpg')).toBe(true);
      expect(matches(rule, 'https://site.example/l2team-navigator/images/sections/skills.min.svg')).toBe(false);
    });

    it('кэширует карту мира через CacheFirst', () => {
      const rule = getRule('maps');
      expect(rule.handler).toBe('CacheFirst');
      expect(matches(rule, 'https://site.example/l2team-navigator/maps/world-map.jpg')).toBe(true);
      expect(matches(rule, 'https://site.example/l2team-navigator/other/not-a-map.png')).toBe(false);
    });

    it('кэширует внешние иконки mw2.wiki и lu4db через StaleWhileRevalidate', () => {
      const rule = getRule('wiki-images');
      expect(rule.handler).toBe('StaleWhileRevalidate');
      expect(matches(rule, 'https://mw2.wiki/i64/skill-icon.png')).toBe(true);
      expect(matches(rule, 'https://lu4db.ru/media/item-icon.png')).toBe(true);
      expect(matches(rule, 'http://mw2.wiki/i64/old.png')).toBe(false);
    });

    it('НЕ кэширует Яндекс.Метрику, Telegram API и сторонние домены', () => {
      const rules = pwaConfig.workbox?.runtimeCaching ?? [];
      const urls = [
        'https://mc.yandex.ru/metrika/tag.js',
        'https://mc.yandex.ru/watch/110798252',
        'https://api.example-render.com/check-user',
        'https://telegram.org/js/telegram-web-app.js',
      ];
      for (const url of urls) {
        expect(
          rules.some((r) => matches(r, url)),
          `${url} не должно матчиться`,
        ).toBe(false);
      }
    });
  });
});
