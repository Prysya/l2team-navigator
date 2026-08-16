export function isActualTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  const webapp = (w.Telegram as Record<string, unknown>)?.WebApp as Record<string, unknown> | undefined;
  return typeof webapp?.initData === 'string' && webapp.initData.length > 0;
}

function safeCall(webApp: Record<string, unknown>, name: string): void {
  const fn = webApp[name];
  if (typeof fn === 'function') {
    try {
      (fn as () => void)();
    } catch {
      // метод недоступен на этом клиенте — пропускаем
    }
  }
}

function requestFullscreen(webApp: Record<string, unknown>): () => void {
  const request = (): void => safeCall(webApp, 'requestFullscreen');

  request();

  const retry = (): void => {
    if (webApp.isFullscreen !== true) {
      request();
    }
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('touchstart', retry);
  };
  window.addEventListener('pointerdown', retry);
  window.addEventListener('touchstart', retry);

  return () => {
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('touchstart', retry);
  };
}

/**
 * Раскрывает Mini App на весь экран при запуске (как у приложения «Плати по миру»).
 * Поочерёдно: expand → disableVerticalSwipes → ready → requestFullscreen.
 * ready вызывается после раскрытия, чтобы лоадер Telegram скрывался уже на полном экране.
 * requestFullscreen дополнительно повторяется при первом тапе, если фулскрин не активировался.
 * Каждый шаг обёрнут в try/catch — на клиентах без поддержки метода он просто пропускается.
 * В обычном браузере — no-op. Возвращает cleanup для снятия слушателей.
 */
export function setupTelegramViewport(): () => void {
  if (!isActualTelegram()) return () => {};

  const webApp = (window.Telegram as Record<string, unknown>)?.WebApp as Record<string, unknown> | undefined;
  if (!webApp) return () => {};

  safeCall(webApp, 'expand');
  safeCall(webApp, 'disableVerticalSwipes');
  safeCall(webApp, 'ready');

  return requestFullscreen(webApp);
}
