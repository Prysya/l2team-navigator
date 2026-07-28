import { describe, expect, it } from 'vitest';

import { formatMSK, formatRespawnLabel, parseRespawn } from '../respawn';

describe('parseRespawn', () => {
  it('returns null for empty string', () => {
    expect(parseRespawn('')).toBeNull();
  });

  it('returns null for fixed respawn', () => {
    expect(parseRespawn('Фиксированное')).toBeNull();
  });

  it('parses 6 hours ± 2 hours', () => {
    expect(parseRespawn('6 часов ± 2 часа')).toEqual({ base: 6, variance: 2 });
  });

  it('parses 9 hours ± 1 hour', () => {
    expect(parseRespawn('9 часов ± 1 час')).toEqual({ base: 9, variance: 1 });
  });

  it('parses 10 hours ± 2 hours', () => {
    expect(parseRespawn('10 часов ± 2 часа')).toEqual({ base: 10, variance: 2 });
  });

  it('parses 12 hours ± 2 hours', () => {
    expect(parseRespawn('12 часов ± 2 часа')).toEqual({ base: 12, variance: 2 });
  });

  it('parses 8 hours ± 2 hours', () => {
    expect(parseRespawn('8 часов ± 2 часа')).toEqual({ base: 8, variance: 2 });
  });

  it('parses 7 hours ± 2 hours', () => {
    expect(parseRespawn('7 часов ± 2 часа')).toEqual({ base: 7, variance: 2 });
  });

  it('returns null for unrecognized format', () => {
    expect(parseRespawn('произвольный текст')).toBeNull();
  });
});

describe('formatRespawnLabel', () => {
  it('formats valid respawn', () => {
    expect(formatRespawnLabel('6 часов ± 2 часа')).toBe('6 ч ± 2 ч');
  });

  it('passes through fixed respawn', () => {
    expect(formatRespawnLabel('Фиксированное')).toBe('Фиксированное');
  });

  it('passes through unrecognized', () => {
    expect(formatRespawnLabel('произвольный текст')).toBe('произвольный текст');
  });
});

describe('formatMSK', () => {
  it('formats date in Moscow timezone', () => {
    const date = new Date('2024-07-15T15:35:00+03:00');
    const result = formatMSK(date);
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    expect(result).toContain('15.07.2024');
  });
});
