export function isActualTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  const webapp = (w.Telegram as Record<string, unknown>)?.WebApp as Record<string, unknown> | undefined;
  return typeof webapp?.initData === 'string' && webapp.initData.length > 0;
}
