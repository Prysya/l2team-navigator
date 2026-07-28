export interface RespawnWindow {
  base: number;
  variance: number;
}

export function parseRespawn(respawn: string): RespawnWindow | null {
  if (!respawn) return null;
  if (respawn.includes('Фиксированное')) return null;
  const match = respawn.match(/(\d+)\s*час[а-я]*\s*±\s*(\d+)\s*час[а-я]*/);
  if (!match) return null;
  return { base: parseInt(match[1], 10), variance: parseInt(match[2], 10) };
}

export function formatRespawnLabel(respawn: string): string {
  const w = parseRespawn(respawn);
  if (!w) return respawn;
  return `${w.base} ч ± ${w.variance} ч`;
}

const MSK_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatMSK(date: Date): string {
  return MSK_FORMATTER.format(date);
}

export function formatRespawnRange(minDate: Date, maxDate: Date): string {
  const minStr = MSK_FORMATTER.format(minDate);
  const maxStr = MSK_FORMATTER.format(maxDate);
  const [minDay, minTime] = minStr.split(', ');
  const [maxDay, maxTime] = maxStr.split(', ');
  if (minDay === maxDay) {
    return `${minDay} ${minTime} — ${maxTime}`;
  }
  return `${minDay} ${minTime} — ${maxDay} ${maxTime}`;
}
