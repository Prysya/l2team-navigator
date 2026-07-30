import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getAuthHeaders } from '../telegramApi';

beforeEach(() => {
  sessionStorage.clear();
  delete (window as unknown as Record<string, unknown>).Telegram;
});

afterEach(() => {
  sessionStorage.clear();
  delete (window as unknown as Record<string, unknown>).Telegram;
});

describe('getAuthHeaders', () => {
  it('returns X-Telegram-Init-Data when Telegram SDK is present', () => {
    (window as unknown as Record<string, unknown>).Telegram = {
      WebApp: { initData: 'tg-init-data' },
    };

    const headers = getAuthHeaders();
    expect(headers['X-Telegram-Init-Data']).toBe('tg-init-data');
  });

  it('returns X-Auth-Token when token is in sessionStorage', () => {
    sessionStorage.setItem('navigator_token', 'test-session-token');

    const headers = getAuthHeaders();
    expect(headers['X-Auth-Token']).toBe('test-session-token');
  });

  it('prefers Telegram initData over sessionStorage token', () => {
    sessionStorage.setItem('navigator_token', 'session-token');
    (window as unknown as Record<string, unknown>).Telegram = {
      WebApp: { initData: 'tg-init-data' },
    };

    const headers = getAuthHeaders();
    expect(headers['X-Telegram-Init-Data']).toBe('tg-init-data');
    expect(headers['X-Auth-Token']).toBeUndefined();
  });

  it('returns empty object when neither is available', () => {
    const headers = getAuthHeaders();
    expect(Object.keys(headers)).toHaveLength(0);
  });
});

// validateToken error handling is tested through AuthGate component test.
// A success test requires a real backend — covered by Playwright e2e (auth.spec.ts).
