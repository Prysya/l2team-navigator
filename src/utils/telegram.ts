export function isActualTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  const tg = w.Telegram as Record<string, unknown> | undefined;
  return typeof tg?.WebApp !== 'undefined' && tg?.WebApp !== null;
}
