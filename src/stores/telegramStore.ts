import { checkClanMembership as apiCheckClan } from '@utils/telegramApi';
import { create } from 'zustand';

/**
 * Все данные из tgWebAppData после парсинга.
 * Содержит полную информацию о пользователе Telegram Mini App.
 *
 * @example
 * {
 *   id: 123456789,
 *   firstName: "Алексей",
 *   lastName: "Иванов",
 *   username: "alex_ivanov",
 *   languageCode: "ru",
 *   isPremium: false,
 *   avatarUrl: "https://t.me/i/userpic/320/abc123.svg",
 *   allowsWriteToPm: true
 * }
 */
export interface TeleUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
  isPremium: boolean;
  avatarUrl: string;
  allowsWriteToPm: boolean;
}

interface TelegramStore {
  isTelegram: boolean;
  platform: string | null;
  themeParams: Record<string, string> | null;
  user: TeleUser | null;
  clanCheckResult: boolean | null;
  clanCheckLoading: boolean;
  clanCheckError: string | null;
  initFromHash: (hash: string) => void;
  checkClanMembership: () => void;
}

export const useTelegramStore = create<TelegramStore>((set, get) => ({
  isTelegram: false,
  platform: null,
  themeParams: null,
  user: null,
  clanCheckResult: null,
  clanCheckLoading: false,
  clanCheckError: null,
  initFromHash(hash: string) {
    const clean = hash.replace(/^[#?]/, '');
    const params = new URLSearchParams(clean);
    const rawData = params.get('tgWebAppData');
    if (!rawData) return;

    const tgParams = new URLSearchParams(rawData);
    const userStr = tgParams.get('user');
    if (!userStr) return;

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      const themeRaw = params.get('tgWebAppThemeParams');
      let themeParams: Record<string, string> | null = null;
      if (themeRaw) {
        try {
          themeParams = JSON.parse(decodeURIComponent(themeRaw));
        } catch {
          // некорректная тема — не критично
        }
      }

      set({
        isTelegram: true,
        platform: params.get('tgWebAppPlatform') || null,
        themeParams,
        user: {
          id: user.id || 0,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
          languageCode: user.language_code || 'en',
          isPremium: user.is_premium || false,
          avatarUrl: user.photo_url || '',
          allowsWriteToPm: user.allows_write_to_pm || false,
        },
      });
    } catch {
      // некорректный JSON в user — не Telegram
    }
  },
  async checkClanMembership() {
    const { user } = get();
    if (!user) return;

    set({ clanCheckLoading: true, clanCheckError: null });

    try {
      const res = await apiCheckClan(user.id, user.username || null);
      set({ clanCheckResult: res.isL2teamUser, clanCheckLoading: false });
    } catch (e) {
      set({
        clanCheckResult: false,
        clanCheckLoading: false,
        clanCheckError: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  },
}));
