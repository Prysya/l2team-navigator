import { describe, expect, it } from 'vitest';

import type { RaidBoss } from '@/types';

import { formatNum, isEpic } from '../RaidBossTab';

describe('formatNum', () => {
  it('returns dash for null', () => {
    expect(formatNum(null)).toBe('–');
  });

  it('formats number with RU locale', () => {
    expect(formatNum('12345')).toBe('12 345');
  });
});

describe('isEpic', () => {
  it('returns true for boss with Фиксированное respawn', () => {
    expect(
      isEpic({ name: '', level: 0, respawn: 'Фиксированное 40с', location: '', stats: null, drops: null } as RaidBoss),
    ).toBe(true);
  });

  it('returns false for regular boss', () => {
    expect(isEpic({ name: '', level: 0, respawn: '40с', location: '', stats: null, drops: null } as RaidBoss)).toBe(
      false,
    );
  });
});
