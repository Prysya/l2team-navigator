import { beforeEach, describe, expect, it } from 'vitest';

import { useTelegramStore } from '../telegramStore';

beforeEach(() => {
  useTelegramStore.setState({ isTelegram: false, platform: null, user: null });
});

describe('telegramStore', () => {
  it('parses tgWebAppData from hash', () => {
    const hash =
      '?tgWebAppData=user%3D%7B%22id%22%3A123456789%2C%22first_name%22%3A%22%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B9%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%7D&tgWebAppPlatform=ios';
    useTelegramStore.getState().initFromHash(hash);
    expect(useTelegramStore.getState().isTelegram).toBe(true);
    expect(useTelegramStore.getState().platform).toBe('ios');
    expect(useTelegramStore.getState().user).toEqual({
      id: 123456789,
      firstName: 'Алексей',
      lastName: '',
      username: '',
      languageCode: 'ru',
      isPremium: false,
      avatarUrl: '',
      allowsWriteToPm: false,
    });
  });

  it('returns false when no tgWebAppData', () => {
    useTelegramStore.getState().initFromHash('?some=other');
    expect(useTelegramStore.getState().isTelegram).toBe(false);
  });

  it('handles malformed JSON gracefully', () => {
    const hash = '?tgWebAppData=user%3Dnot-json';
    useTelegramStore.getState().initFromHash(hash);
    expect(useTelegramStore.getState().isTelegram).toBe(false);
  });

  it('parses premium user', () => {
    const hash =
      '?tgWebAppData=user%3D%7B%22id%22%3A999%2C%22first_name%22%3A%22Test%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%7D&tgWebAppPlatform=android';
    useTelegramStore.getState().initFromHash(hash);
    expect(useTelegramStore.getState().user?.isPremium).toBe(true);
    expect(useTelegramStore.getState().platform).toBe('android');
  });
});
