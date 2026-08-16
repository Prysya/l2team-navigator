import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setupTelegramViewport } from '../telegram';

type WebAppMock = Record<string, unknown>;

const METHOD_NAMES = ['expand', 'disableVerticalSwipes', 'ready', 'requestFullscreen'] as const;

function setWebApp(overrides: Partial<WebAppMock> = {}) {
  const calls: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const name of METHOD_NAMES) {
    calls[name] = vi.fn();
  }
  const webApp: WebAppMock = {
    initData: 'tg-init-data',
    isFullscreen: false,
    ...calls,
    ...overrides,
  };
  (window as unknown as Record<string, unknown>).Telegram = { WebApp: webApp };
  return { calls, webApp };
}

beforeEach(() => {
  delete (window as unknown as Record<string, unknown>).Telegram;
});

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).Telegram;
});

describe('setupTelegramViewport', () => {
  it('calls expand, disableVerticalSwipes, ready, requestFullscreen in order', () => {
    const { calls } = setWebApp();

    setupTelegramViewport();

    for (const name of METHOD_NAMES) {
      expect(calls[name]).toHaveBeenCalledTimes(1);
    }
    const order = METHOD_NAMES.map((name) => calls[name].mock.invocationCallOrder[0]);
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    expect(order[2]).toBeLessThan(order[3]);
  });

  it('retries requestFullscreen on first pointerdown when not fullscreen', () => {
    const { calls } = setWebApp();
    setupTelegramViewport();
    calls.requestFullscreen.mockClear();

    window.dispatchEvent(new Event('pointerdown'));

    expect(calls.requestFullscreen).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('pointerdown'));
    expect(calls.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('does not retry requestFullscreen when already fullscreen', () => {
    const { calls } = setWebApp({ isFullscreen: true });
    setupTelegramViewport();
    calls.requestFullscreen.mockClear();

    window.dispatchEvent(new Event('pointerdown'));

    expect(calls.requestFullscreen).not.toHaveBeenCalled();
  });

  it('cleanup removes the retry listeners', () => {
    const { calls } = setWebApp();
    const cleanup = setupTelegramViewport();
    calls.requestFullscreen.mockClear();

    cleanup();
    window.dispatchEvent(new Event('pointerdown'));
    window.dispatchEvent(new Event('touchstart'));

    expect(calls.requestFullscreen).not.toHaveBeenCalled();
  });

  it('skips missing methods without throwing', () => {
    setWebApp({ expand: undefined, ready: undefined });

    expect(() => setupTelegramViewport()).not.toThrow();
  });

  it('swallows errors from Telegram methods', () => {
    const { calls } = setWebApp();
    calls.expand.mockImplementation(() => {
      throw new Error('not supported');
    });

    expect(() => setupTelegramViewport()).not.toThrow();
  });

  it('is a no-op when Telegram SDK is absent', () => {
    expect(() => setupTelegramViewport()).not.toThrow();
  });

  it('is a no-op when initData is empty', () => {
    const { calls } = setWebApp({ initData: '' });

    setupTelegramViewport();

    for (const name of METHOD_NAMES) {
      expect(calls[name]).not.toHaveBeenCalled();
    }
  });
});
